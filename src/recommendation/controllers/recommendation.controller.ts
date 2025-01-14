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

@Controller('get-rec')
export default class RecommendationController {
  constructor(
    private readonly recommendationsService: ArticleRecommendationService,
  ) {}

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
}
