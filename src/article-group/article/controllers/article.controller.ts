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
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseArrayPipe,
} from '@nestjs/common';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { query } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Article } from '@/.typeorm/entities/article.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { ArticleService } from '../services/article.service';

const imageFileValidator = new ParseFilePipe({
  validators: [
    new FileTypeValidator({ fileType: /(image\/jpeg|image\/png|image\/gif)/ }),
    new MaxFileSizeValidator({
      maxSize: 10 * 1024 * 1024,
      message: 'file must be smaller than 10 MB',
    }),
  ],
  fileIsRequired: false,
});

@ApiTags('Article')
@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.createArticle(createArticleDto, file);
  }

  @Get('/search')
  search(
    @Query('DISEASES_TYPE_IDS', new ParseArrayPipe({ items: Number }))
    query?: {
      page?: number;
      limit?: number;
      search?: string;
      diseaseId?: number;
    },
  ): Promise<PaginatedResponse<Article>> {
    return this.articleService.search(query);
  }

  @Get('/:aid')
  getById(@Param('aid') aid: number): Promise<Article> {
    return this.articleService.findOne(aid);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Body() dto: UpdateArticleDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.update(dto.AID, dto, file);
  }

  @Delete('/:aid')
  delete(
    @Param('aid') aid: number,
  ): Promise<{ message: string; success: boolean }> {
    return this.articleService.delete(aid);
  }

  @Get('/reccommend')
  getReccommend() {}

  // @Get('types')
  // getTypes() {}
}
