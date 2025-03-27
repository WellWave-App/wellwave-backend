import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  UseGuards,
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { QuestService } from '../services/quest.service';
import { HabitCategories } from '@/.typeorm/entities/habit.entity';
import { QuestProgress } from '@/.typeorm/entities/quest-progress.entity';
import { Quest } from '@/.typeorm/entities/quest.entity';
import { UserQuests } from '@/.typeorm/entities/user-quests.entity';
import { CreateQuestDto } from '../dtos/create-quest.dto';
import { TrackQuestDto } from '../dtos/track-quest.dto';
import { QuestListFilter } from '../interfaces/quests.interfaces';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { imageFileValidator } from '@/image/imageFileValidator';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';

@ApiTags('Quest')
@Controller('quest')
@UseGuards(JwtAuthGuard, RoleGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @ApiOperation({ summary: 'Create a new quest' })
  @ApiResponse({
    status: 201,
    description: 'Quest created successfully',
    type: Quest,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiBody({ type: CreateQuestDto })
  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @UseInterceptors(FileInterceptor('file'))
  createQuest(
    @Body() createQuestDto: CreateQuestDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Quest> {
    return this.questService.createQuest(createQuestDto, file);
  }

  @ApiOperation({ summary: 'Get all quests with optional filters' })
  @ApiQuery({ name: 'filter', enum: QuestListFilter, required: false })
  @ApiQuery({ name: 'category', enum: HabitCategories, required: false })
  @ApiResponse({ status: 200, description: 'Retrieved quests successfully' })
  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getQuests(
    @Request() req,
    @Query('filter') filter: QuestListFilter = QuestListFilter.ALL,
    @Query('category') category?: HabitCategories,
  ): Promise<any[]> {
    return this.questService.getQuests(req.user.UID, filter, category);
  }

  @ApiOperation({ summary: 'Start a quest for the current user' })
  @ApiParam({ name: 'questId', description: 'ID of the quest to start' })
  @ApiResponse({
    status: 201,
    description: 'Quest started successfully',
    type: UserQuests,
  })
  @ApiResponse({ status: 404, description: 'Quest not found' })
  @ApiResponse({ status: 409, description: 'Quest already active' })
  @Post('/start/:questId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  startQuest(
    @Request() req,
    @Param('questId') questId: number,
  ): Promise<UserQuests> {
    return this.questService.startQuest(req.user.UID, questId);
  }

  // @ApiOperation({ summary: 'Track progress for a quest' })
  // @ApiBody({ type: TrackQuestDto })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Progress tracked successfully',
  //   type: QuestProgress,
  // })
  // @ApiResponse({ status: 404, description: 'Active quest not found' })
  // @Post('/track')
  // @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  // trackProgress(
  //   @Request() req,
  //   @Body() trackDto: TrackQuestDto,
  // ): Promise<QuestProgress> {
  //   return this.questService.trackProgress(req.user.UID, trackDto);
  // }

  @ApiOperation({ summary: 'Get statistics for a specific quest' })
  @ApiParam({
    name: 'questId',
    description: 'ID of the quest to get stats for',
  })
  @ApiResponse({
    status: 200,
    description: 'Retrieved quest stats successfully',
  })
  @ApiResponse({ status: 404, description: 'Quest not found' })
  @Get('/stats/:questId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getQuestStats(
    @Request() req,
    @Param('questId') questId: number,
  ): Promise<any> {
    return this.questService.getQuestStats(req.user.UID, questId);
  }

  @Delete('/:qid')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  deleteQuest(@Param('qid') qid: number) {
    return this.questService.remove(qid);
  }
}
