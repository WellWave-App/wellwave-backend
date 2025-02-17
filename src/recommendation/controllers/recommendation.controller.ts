import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ArticleRecommendationService } from '../services/article-recommendation.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from '@/response/response.interface';
import { Article } from '@/.typeorm/entities/article.entity';
import { USER_GOAL } from '@/.typeorm/entities/users.entity';
import { testUsers, testHabits } from '../services/_test_/rec-habits';
import { HabitRecommendService } from '../services/habits-recommendation.service';

@ApiTags('Recommendations')
@Controller('get-rec')
export default class RecommendationController {
  constructor(
    private readonly recommendationsService: ArticleRecommendationService,
  ) {}

  @ApiOperation({ summary: 'Get recommended articles for a user' })
  @ApiQuery({
    name: 'uid',
    type: Number,
    description: 'User ID',
    required: true,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Limit results (default: 9)',
    required: false,
  })
  @ApiQuery({
    name: 'includeRead',
    type: Boolean,
    description:
      'Include already read articles in recommendations (default: false -> not return article that user already read)',
    required: false,
  })
  @ApiResponse({
    status: 200,
    description: 'List of recommended articles',
    schema: {
      example: {
        data: [
          {
            AID: 1,
            title: 'Article Title',
            content: 'Article content...',
            score: 0.95,
          },
        ],
        meta: {
          total: 1,
          limit: 9,
        },
      },
    },
  })
  @Get('/articles')
  async getRecommendations(
    @Query('uid') userId: number,
    @Query('limit') limit?: number,
    @Query('includeRead') includeRead?: boolean,
  ) {
    return this.recommendationsService.getReccomendedArticle(
      userId,
      limit || 9,
      includeRead || false,
    );
  }

  @Get('/test-habits')
  async testRecommendationSystem() {
    for (const user of testUsers) {
      console.log(`\nRecommendations for ${user.USERNAME}:`);
      console.log(
        `Risk Profile: Diabetes=${user.RiskAssessment.DIABETES}, Hypertension=${user.RiskAssessment.HYPERTENSION}, DYSLIPIDEMIA=${user.RiskAssessment.DYSLIPIDEMIA}, OBESITY=${user.RiskAssessment.OBESITY}`,
      );
      console.log(`Goal: ${USER_GOAL[user.USER_GOAL]}`);

      const recommendations = await HabitRecommendService.recommendHabits(
        testHabits,
        user,
        testUsers,
        3, // Get top 3 recommendations
      );

      console.log('Recommended Habits:');
      recommendations.forEach((habit, index) => {
        console.log(
          `${index + 1}. ${habit.habit.TITLE} (${habit.habit.CATEGORY}) ${habit.scoreInfo.score}`,
        );
      });
    }

    const recommendations = await HabitRecommendService.recommendHabits(
      testHabits,
      testUsers[0],
      testUsers,
      4, // Get top 3 recommendations
    );

    return recommendations;
  }
}
