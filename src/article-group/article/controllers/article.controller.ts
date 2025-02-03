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
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Article } from '@/.typeorm/entities/article.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { ArticleService } from '../services/article.service';
import { ArticleParams } from '../repositories/article.repository';

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

  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create a new article' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (JPEG/PNG/GIF, max 10MB)',
        },
        TOPIC: { type: 'string', description: 'Article topic' },
        BODY: { type: 'string', description: 'Article body' },
        DISEASES_TYPE_IDS: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of disease type IDs',
        },
        ESTIMATED_READ_TIME: {
          type: 'number',
          description:
            'Estimated read time in minutes will be calculate by body length / 200 wpm',
        },
        AUTHOR: { type: 'string', description: 'Author name (optional)' },
        THUMBNAIL_URL: {
          type: 'string',
          description: 'Thumbnail URL (generate when upload file)',
        },
        VIEW_COUNT: { type: 'number', description: 'View count', default: 0 },
      },
      required: ['TOPIC', 'BODY', 'file', 'DISEASES_TYPE_IDS'],
    },
  })
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
    @Query()
    query?: ArticleParams,
  ): Promise<PaginatedResponse<Article>> {
    if (query.diseaseIds && !Array.isArray(query.diseaseIds)) {
      query.diseaseIds = [query.diseaseIds];
    }

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
