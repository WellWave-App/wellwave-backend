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
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
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

  @Post()
  @ApiOperation({ summary: 'Create a new article' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateArticleDto,
    description: 'Article creation data with optional file upload',
  })
  @ApiResponse({
    status: 201,
    description: 'Article created successfully',
    type: Article,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createArticleDto: CreateArticleDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.createArticle(createArticleDto, file);
  }

  @Get('/search')
  @ApiOperation({ summary: 'Search articles with optional filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number for pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of items per page',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for article topics',
  })
  @ApiQuery({
    name: 'diseaseIds',
    required: false,
    type: [Number],
    description: 'Filter by disease type IDs',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of articles',
    // schema: {example: {data: Article[], meta: {total: }}},
  })
  search(@Query() query?: ArticleParams): Promise<PaginatedResponse<Article>> {
    if (query.diseaseIds && !Array.isArray(query.diseaseIds)) {
      query.diseaseIds = [query.diseaseIds];
    }
    return this.articleService.search(query);
  }

  @Get('/:aid')
  @ApiOperation({ summary: 'Get article by ID' })
  @ApiParam({
    name: 'aid',
    type: Number,
    description: 'Article ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the article',
    type: Article,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  getById(@Param('aid') aid: number): Promise<Article> {
    return this.articleService.findOne(aid);
  }

  @Patch()
  @ApiOperation({ summary: 'Update an article' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateArticleDto,
    description: 'Article update data with optional file upload',
  })
  @ApiResponse({
    status: 200,
    description: 'Article updated successfully',
    type: Article,
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Body() dto: UpdateArticleDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Article> {
    return this.articleService.update(dto.AID, dto, file);
  }

  @Delete('/:aid')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiParam({
    name: 'aid',
    type: Number,
    description: 'Article ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Article deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Article not found' })
  delete(
    @Param('aid') aid: number,
  ): Promise<{ message: string; success: boolean }> {
    return this.articleService.delete(aid);
  }
}
