import { Injectable } from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import {
  ArticleRepository,
  articleQuery,
} from '../repositories/article.repository';
import { ImageService } from '@/image/image.service';
import { Article } from '@/.typeorm/entities/article.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { ArticleRecommendationService } from '@/recommendation/services/article-recommendation.service';

@Injectable()
export class ArticleService {
  constructor(
    private readonly articleRepository: ArticleRepository,
    private readonly imageService: ImageService,
    // private readonly articleRecommendationService: ArticleRecommendationService,
  ) {}

  private calculateReadTime(body: string) {
    return parseInt((body.length / 200).toFixed(2));
  }

  async createArticle(dto: CreateArticleDto, file?: Express.Multer.File) {
    dto.ESTIMATED_READ_TIME = this.calculateReadTime(dto.BODY);

    if (file) {
      dto.THUMBNAIL_URL = this.imageService.getImageUrl(file.filename);
    }

    return await this.articleRepository.create(dto);
  }

  async search(query?: articleQuery): Promise<PaginatedResponse<Article>> {
    return await this.articleRepository.findAll(query);
  }

  async findOne(id: number): Promise<Article> {
    return await this.articleRepository.findById(id);
  }

  async update(
    id: number,
    dto: UpdateArticleDto,
    file?: Express.Multer.File,
  ): Promise<Article> {
    if (dto.BODY) {
      dto.ESTIMATED_READ_TIME = this.calculateReadTime(dto.BODY);
    }

    if (file) {
      dto.THUMBNAIL_URL = this.imageService.getImageUrl(file.filename);
    }

    return await this.articleRepository.update(id, dto);
  }

  async delete(id: number): Promise<{ message: string; success: boolean }> {
    return await this.articleRepository.remove(id);
  }

  // async getRec(userId: number, limit?: number, includeRead?: boolean) {
  //   return this.articleRecommendationService.getReccomendedArticle(
  //     userId,
  //     limit,
  //     includeRead,
  //   );
  // }
}
