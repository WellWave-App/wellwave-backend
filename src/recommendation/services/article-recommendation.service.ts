import { Article } from '@/.typeorm/entities/article.entity';
import { DiseaseType } from '@/.typeorm/entities/disease-types.entity';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { User } from '@/.typeorm/entities/users.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { RiskCalculator, RiskLevel } from '../utils/risk-calculator.util';
import { ArticleScore } from '../interfaces/article-score.interface';
import { PaginatedResponse } from '../../response/response.interface';
import { RiskAssessmentEntity } from '@/.typeorm/entities/assessment.entity';
import { DateService } from '@/helpers/date/date.services';

@Injectable()
export class ArticleRecommendationService {
  constructor(
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(UserReadHistory)
    private userReadHistoryRepository: Repository<UserReadHistory>,
    @InjectRepository(RiskAssessmentEntity)
    private userRisk: Repository<RiskAssessmentEntity>,
    private readonly dateService: DateService,
  ) {}

  private INTERACTION_WEIGHTS = {
    READ: 1.0, // Base weight for reading
    BOOKMARK: 2.0, // Bookmarks worth 2x more than reads
    RECENT_READ: 1.2, // 20% boost for recent reads (e.g., last 7 days)
  };

  private calculateUserRiskProfile(userRisk: RiskAssessmentEntity) {
    const diabetesWeight = RiskCalculator.calculateDiabetesWeight(
      userRisk.DIABETES,
    );
    const hypertensionWeight = RiskCalculator.calculateHypertensionWeight(
      userRisk.HYPERTENSION,
    );
    const dyslipidemiaWeight = RiskCalculator.calculateDyslipidemiaWeight(
      userRisk.DYSLIPIDEMIA,
    );
    const obesityWeight = RiskCalculator.calculateObesityWeight(
      userRisk.OBESITY,
    );

    // Calculate overall risk level
    const overallRiskLevel = RiskCalculator.calculateOverallRiskLevel({
      diabetes: userRisk.DIABETES,
      hypertension: userRisk.HYPERTENSION,
      dyslipidemia: userRisk.DYSLIPIDEMIA,
      obesity: userRisk.OBESITY,
    });

    return {
      weights: {
        DIABETES: diabetesWeight,
        HYPERTENSION: hypertensionWeight,
        DYSLIPIDEMIA: dyslipidemiaWeight,
        OBESITY: obesityWeight,
      },
      overallRiskLevel,
    };
  }

  private async calculateContentBasedScores(
    userId: number,
    riskProfile: ReturnType<typeof this.calculateUserRiskProfile>,
  ): Promise<ArticleScore[]> {
    const articles = await this.articleRepository.find({
      relations: ['diseases'],
    });

    return articles.map((article) => {
      let relevanceScore = 0;
      let totalWeight = 0;

      // Calculate weighted relevance based on user's risk profile
      article.diseases.forEach((disease) => {
        const diseaseWeight =
          riskProfile.weights[disease.ENG_NAME.toUpperCase()];
        if (diseaseWeight) {
          relevanceScore += diseaseWeight;
          totalWeight += 1;
        }
      });

      // Normalize score and adjust based on overall risk level
      let finalScore = totalWeight > 0 ? relevanceScore / totalWeight : 0;

      // Boost scores for high-risk users
      switch (riskProfile.overallRiskLevel) {
        case RiskLevel.VERY_HIGH:
          finalScore *= 1.3; // 30% boost
          break;
        case RiskLevel.HIGH:
          finalScore *= 1.2; // 20% boost
          break;
        case RiskLevel.MODERATE:
          finalScore *= 1.1; // 10% boost
          break;
      }

      return {
        articleId: article.AID,
        score: Math.min(finalScore, 1),
      };
    });
  }

  // Calculate collaborative scores based on user behavior patterns
  private async calculateCollaborativeScores(
    userId: number,
  ): Promise<ArticleScore[]> {
    // Get reading patterns of similar users
    const userHistory = await this.userReadHistoryRepository.find({
      where: { user: { UID: userId } },
      relations: ['article'],
    });

    // Get articles read by users with similar reading patterns
    const articleIds = userHistory.map((h) => h.AID);
    if (articleIds.length === 0) return [];

    const similarUsersHistory = await this.userReadHistoryRepository
      .createQueryBuilder('history')
      .innerJoinAndSelect('history.user', 'user')
      .innerJoinAndSelect('history.article', 'article')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('DISTINCT ur.UID')
          .from(UserReadHistory, 'ur')
          .where('ur.AID IN (:...articleIds)', { articleIds })
          .getQuery();
        return 'history.UID IN ' + subQuery;
      })
      .getMany();

    // Calculate article scores based on similar users' reading patterns
    const articleScores = new Map<number, number>();
    const now = new Date(this.dateService.getCurrentDate().timestamp);
    const RECENT_THRESHOLD = 7; // days

    similarUsersHistory.forEach((history) => {
      let interactionScore = 0;
      const userLastedRead = new Date(history.LASTED_READ_DATE);

      interactionScore += history.IS_READ ? this.INTERACTION_WEIGHTS.READ : 0;
      interactionScore += history.IS_BOOKMARK
        ? this.INTERACTION_WEIGHTS.BOOKMARK
        : 0;

      const daysSinceLastRead = Math.floor(
        (now.getTime() - userLastedRead.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (daysSinceLastRead <= RECENT_THRESHOLD) {
        interactionScore *= this.INTERACTION_WEIGHTS.RECENT_READ;
      }

      const currentScore = articleScores.get(history.AID) || 0;
      articleScores.set(history.AID, currentScore + interactionScore);
    });

    // Normalize scores
    const maxScore = Math.max(...articleScores.values());

    return Array.from(articleScores.entries()).map(([articleId, score]) => ({
      articleId,
      score: score / maxScore,
    }));
  }

  async getReccomendedArticle(
    userId: number,
    limit: number = 9,
    includeRead: boolean = false,
  ): Promise<PaginatedResponse<Article>> {
    // const user = await this.usersRepository.findOne({ where: { UID: userId } });
    const [userRisk] = await this.userRisk.find({
      where: { UID: userId },
      order: { createAt: 'DESC' },
      take: 1,
    });

    if (!userRisk) {
      throw new NotFoundException(`userRisk of UID: ${userId} not found`);
    }

    // const riskProfile = this.calculateUserRiskProfile(user);
    const riskProfile = this.calculateUserRiskProfile(userRisk);

    const [contentScores, collaborativeScores] = await Promise.all([
      this.calculateContentBasedScores(userId, riskProfile),
      this.calculateCollaborativeScores(userId),
    ]);

    let contentWeight = 0.7;
    let collaborativeWeight = 0.3;

    // Increase content-based weight for higher risk users
    switch (riskProfile.overallRiskLevel) {
      case RiskLevel.VERY_HIGH:
        contentWeight = 0.85;
        collaborativeWeight = 0.15;
        break;
      case RiskLevel.HIGH:
        contentWeight = 0.8;
        collaborativeWeight = 0.2;
        break;
      case RiskLevel.MODERATE:
        contentWeight = 0.75;
        collaborativeWeight = 0.25;
        break;
    }

    const combinedScores = new Map<number, number>();

    contentScores.forEach(({ articleId, score }) => {
      combinedScores.set(articleId, score * contentWeight);
    });

    collaborativeScores.forEach(({ articleId, score }) => {
      const currentScore = combinedScores.get(articleId) || 0;
      combinedScores.set(articleId, currentScore + score * collaborativeWeight);
    });

    let readArticleIds: number[] = [];
    if (!includeRead) {
      const readHistory = await this.userReadHistoryRepository.find({
        where: { user: { UID: userId } },
        select: ['AID'],
      });
      readArticleIds = readHistory.map((h) => h.AID);
    }

    const sortedArticleIdsWithScores = Array.from(combinedScores.entries())
      .filter(([articleId]) => !readArticleIds.includes(articleId))
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    const sortedArticleIds = sortedArticleIdsWithScores.map(
      ([articleId]) => articleId,
    );

    const articles = await this.articleRepository.find({
      where: { AID: In(sortedArticleIds) },
      relations: ['diseases'],
    });

    // Map articles to include their scores
    const articlesWithScores = articles.map((article) => {
      const score = combinedScores.get(article.AID) || 0;
      return { ...article, score };
    });

    // Sort articles by score before returning
    const sortedArticles = articlesWithScores.sort((a, b) => b.score - a.score);

    return {
      data: sortedArticles,
      meta: {
        total: sortedArticles.length,
        limit,
      },
    };
  }
}
