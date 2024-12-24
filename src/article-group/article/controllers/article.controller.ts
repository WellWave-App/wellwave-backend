import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { query } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Article } from '@/.typeorm/entities/article.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { ArticleService } from '../services/article.service';

@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get(':aid')
  getById(@Param('aid') aid: number): Promise<Article> {
    return this.articleService.findOne(aid);
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.createArticle(createArticleDto, file);
  }

  @Get('search')
  search(
    @Query()
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      diseaseId?: number;
    },
  ): Promise<PaginatedResponse<Article>> {
    return this.articleService.search(query);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Body() dto: UpdateArticleDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.update(dto.AID, dto, file);
  }
  @Get()
  getReccommend() {}

  @Get()
  getTypes() {}
}
