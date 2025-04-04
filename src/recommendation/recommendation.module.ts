import { forwardRef, Module } from '@nestjs/common';
import RecommendationController from './controllers/recommendation.controller';
import { ArticleRecommendationService } from './services/article-recommendation.service';
import { UsersModule } from '@/users/users.module';
import { ArticleModule } from '@/article-group/article/article.module';
import { UserReadHistoryModule } from '@/article-group/user-read-history/user-read-history.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '@/.typeorm/entities/article.entity';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { User } from '@/.typeorm/entities/users.entity';
import { DiseaseType } from '@/.typeorm/entities/disease-types.entity';
import { RiskCalculator } from './utils/risk-calculator.util';
import { RiskAssessmentEntity } from '@/.typeorm/entities/assessment.entity';
import { HabitRecommendService } from './services/habits-recommendation.service';
import { HelperModule } from '@/helpers/helper.module';

@Module({
  imports: [
    forwardRef(() => ArticleModule),
    forwardRef(() => UserReadHistoryModule),
    TypeOrmModule.forFeature([Article, UserReadHistory, RiskAssessmentEntity]),
    HelperModule,
  ],
  controllers: [RecommendationController],
  providers: [
    RiskCalculator,
    ArticleRecommendationService,
    HabitRecommendService,
  ],
  exports: [
    RiskCalculator,
    ArticleRecommendationService,
    HabitRecommendService,
  ],
})
export class RecommendationModule {}
