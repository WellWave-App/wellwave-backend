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
    if (limit !== null) {
      limit = 9;
    }

    if (includeRead !== null) {
      includeRead = false;
    }

    return this.recommendationsService.getReccomendedArticle(
      userId,
      limit,
      includeRead,
    );
  }
}
