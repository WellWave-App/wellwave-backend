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
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from '@/response/response.interface';
import { Article } from '@/.typeorm/entities/article.entity';

@ApiTags('Recommendations')
@Controller('get-rec')
export default class RecommendationController {
  constructor(
    private readonly recommendationsService: ArticleRecommendationService,
  ) {}

  @Get('/articles')
  // @ApiQuery({ name: 'uid', type: Number, description: 'User ID' })
  // @ApiQuery({
  //   name: 'limit',
  //   type: Number,
  //   required: false,
  //   description: 'Maximum number of articles to return (default: 9)',
  // })
  // @ApiQuery({
  //   name: 'includeRead',
  //   type: Boolean,
  //   required: false,
  //   description:
  //     'Include user already read articles in the recommendations? (default: false)',
  // })
  // // @ApiResponse({
  // //   status: 200,
  // //   description: 'List of recommended articles',
  // //   // type: PaginatedResponse<Article>, // Ensure PaginatedResponse<Article> is defined
  // // })
  // // @ApiResponse({ status: 404, description: 'User not found' })
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
