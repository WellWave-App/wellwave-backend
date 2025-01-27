import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  CategoriesFilters,
  CategoriesParamsDto,
  HabitFilterStatus,
  HabitListFilter,
} from '../interfaces/habits.interfaces';
import { HabitService } from '../services/habit.service';
import { HabitCategories, Habits } from '@/.typeorm/entities/habit.entity';
import { StartHabitChallengeDto } from '../dto/user-habit.dto';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateHabitDto } from '../dto/update-habit.dto';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { TrackHabitDto } from '../dto/track-habit.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

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

@Controller('habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  // @Get('/search-habits')
  // async searchHabits(
  //   @Query()
  //   params: {
  //     uid?: number;
  //     page?: number;
  //     limit?: number;
  //     pagination?: boolean;
  //     filterCategory?: HabitCategories;
  //     filterStatus?: HabitFilterStatus;
  //     query?: string;
  //   },
  // ) {
  //   return await this.habitService.searchHabits(params);
  // }

  // @Post('/join-habit')
  // async joinHabit(@Body() dto: StartHabitChallengeDto) {
  //   return await this.habitService.assignHabitToUser(dto);
  // }

  // @Post()
  // @UseInterceptors(FileInterceptor('file'))
  // async createNewHabit(
  //   @Body() dto: CreateHabitDto,
  //   @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  // ) {
  //   return await this.habitService.createNewHabit(dto, file);
  // }

  // @Patch()
  // @UseInterceptors(FileInterceptor('file'))
  // async updateHabit(
  //   @Body() dto: UpdateHabitDto,
  //   @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  // ) {
  //   return await this.habitService.updateHabit(dto, file);
  // }

  // @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  createHabit(
    @Body() createHabitDto: CreateHabitDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Habits> {
    return this.habitService.createHabit(createHabitDto, file);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  getHabits(
    @Request() req,
    @Query('filter') filter?: HabitListFilter,
    @Query('category') category?: HabitCategories,
  ): Promise<Habits[]> {
    return this.habitService.getHabits(req.user.UID, filter, category);
  }

  @Post('/challenge')
  @UseGuards(JwtAuthGuard)
  startChallenge(
    @Request() req,
    @Body() startDto: StartHabitChallengeDto,
  ): Promise<UserHabits> {
    return this.habitService.startChallenge(req.user.UID, startDto);
  }

  @Post('/track')
  @UseGuards(JwtAuthGuard)
  trackHabit(
    @Request() req,
    @Body() trackDto: TrackHabitDto,
  ): Promise<DailyHabitTrack> {
    return this.habitService.trackHabit(req.user.UID, trackDto);
  }

  @Get('/user')
  @UseGuards(JwtAuthGuard)
  getUserHabits(
    @Request() req,
    @Query('status') status?: HabitStatus,
  ): Promise<UserHabits[]> {
    return this.habitService.getUserHabits(req.user.id, status);
  }

  @Get('/stats/:challengeId')
  @UseGuards(JwtAuthGuard)
  getHabitStats(
    @Request() req,
    @Param('challengeId') challengeId: number,
  ): Promise<any> {
    return this.habitService.getHabitStats(req.user.id, challengeId);
  }
}
