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
import { UserReadHistoryService } from '../services/user-read-history.service';
import { CreateUserReadHistoryDto } from '../dto/create-user-read-history.dto';
import { UpdateUserReadHistoryDto } from '../dto/update-user-read-history.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Article')
@Controller('user-read-history')
export class UserReadHistoryController {
  constructor(private readonly service: UserReadHistoryService) {}

  @ApiOperation({ summary: 'Get all bookmarked articles for a user' })
  @ApiParam({ name: 'uid', description: 'User ID', example: 1 })
  @Get('/bookmarks/:uid')
  getBookmarks(@Param('uid') uid: number) {
    return this.service.getBookmarkedArticles(+uid);
  }

  @ApiOperation({ summary: 'Get user’s read history with optional pagination' })
  @ApiParam({ name: 'uid', description: 'User ID', example: 1, required: true })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Limit per page', required: false })
  @Get('/:uid')
  getUserHistory(
    @Param('uid') uid: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.service.findAll(+uid, page, limit);
  }

  @ApiOperation({ summary: 'Get specific article read history for a user' })
  @ApiParam({ name: 'uid', description: 'User ID', example: 1 })
  @ApiParam({ name: 'aid', description: 'Article ID', example: 101 })
  @Get('/:uid/:aid')
  getOne(@Param('uid') uid: number, @Param('aid') aid: number) {
    return this.service.findOne(+uid, +aid);
  }

  @ApiOperation({
    summary: 'Get all user read histories with optional pagination',
  })
  @ApiQuery({ name: 'page', description: 'Page number', required: false })
  @ApiQuery({ name: 'limit', description: 'Limit per page', required: false })
  @Get()
  getAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.service.findAll(null, page, limit);
  }

  @ApiOperation({ summary: 'Create a read history for a user and an article' })
  @Post()
  createHistory(@Body() dto: CreateUserReadHistoryDto) {
    return this.service.create(dto);
  }

  @ApiOperation({ summary: 'Add an article to user’s bookmarks' })
  @ApiParam({ name: 'uid', description: 'User ID', example: 1 })
  @ApiParam({ name: 'aid', description: 'Article ID', example: 101 })
  @Patch('/addBookmark/:uid/:aid')
  addBookmark(@Param('uid') uid: number, @Param('aid') aid: number) {
    return this.service.updateBookmark(uid, aid, true);
  }

  @ApiOperation({ summary: 'Remove an article from user’s bookmarks' })
  @ApiParam({ name: 'uid', description: 'User ID', example: 1 })
  @ApiParam({ name: 'aid', description: 'Article ID', example: 101 })
  @Patch('/removeBookmark/:uid/:aid')
  removeBookmark(@Param('uid') uid: number, @Param('aid') aid: number) {
    return this.service.updateBookmark(uid, aid, false);
  }

  @Post('enterRead')
  enterRead(@Body() dto: CreateUserReadHistoryDto) {
    return this.service.enterRead(dto);
  }
}
