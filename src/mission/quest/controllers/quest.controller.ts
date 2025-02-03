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

@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  createQuest(
    @Body() createQuestDto: CreateQuestDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Quest> {
    return this.questService.createQuest(createQuestDto, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getQuests(
    @Request() req,
    @Query('filter') filter: QuestListFilter = QuestListFilter.ALL,
    @Query('category') category?: HabitCategories,
  ): Promise<any[]> {
    return this.questService.getQuests(req.user.UID, filter, category);
  }

  @Post('/start/:questId')
  @UseGuards(JwtAuthGuard)
  startQuest(
    @Request() req,
    @Param('questId') questId: number,
  ): Promise<UserQuests> {
    return this.questService.startQuest(req.user.UID, questId);
  }

  @Post('/track')
  @UseGuards(JwtAuthGuard)
  trackProgress(
    @Request() req,
    @Body() trackDto: TrackQuestDto,
  ): Promise<QuestProgress> {
    return this.questService.trackProgress(req.user.UID, trackDto);
  }

  @Get('/stats/:questId')
  @UseGuards(JwtAuthGuard)
  getQuestStats(
    @Request() req,
    @Param('questId') questId: number,
  ): Promise<any> {
    return this.questService.getQuestStats(req.user.UID, questId);
  }
}
