import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  UseInterceptors,
  Request,
  UseGuards,
} from '@nestjs/common';
import { HabitListFilter } from '../interfaces/habits.interfaces';
import { HabitService } from '../services/habit.service';
import { HabitCategories, Habits } from '@/.typeorm/entities/habit.entity';
import { StartHabitChallengeDto } from '../dto/user-habit.dto';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { TrackHabitDto, UpdateDailyTrackDto } from '../dto/track-habit.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { imageFileValidator } from '@/image/imageFileValidator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { updateHabitNotiDto } from '../dto/noti-update.dto';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { Patch } from '@nestjs/common';

@ApiTags('Habits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('habit')
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.ADMIN, Role.MODERATOR)
  @ApiOperation({
    summary: 'Create a new habit',
    description: 'Create a new habit with optional thumbnail image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateHabitDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Habit created successfully',
    type: Habits,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient role permissions',
  })
  createHabit(
    @Body() createHabitDto: CreateHabitDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ): Promise<Habits> {
    return this.habitService.createHabit(createHabitDto, file);
  }

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Get habits list',
    description: 'Get a list of habits with optional filtering and pagination',
  })
  @ApiQuery({ name: 'filter', enum: HabitListFilter, required: false })
  @ApiQuery({ name: 'category', enum: HabitCategories, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'pagination', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: 'List of habits retrieved successfully',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getHabits(
    @Request() req,
    @Query('filter') filter?: HabitListFilter,
    @Query('category') category?: HabitCategories | 'rec',
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('pagination') pagination?: boolean,
  ) {
    return this.habitService.getHabits(
      req.user.UID,
      filter,
      category,
      page || 1,
      limit || 10,
      pagination,
    );
  }

  @Post('/challenge')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Start a habit challenge',
    description: 'Start a new habit challenge for the user',
  })
  @ApiBody({ type: StartHabitChallengeDto })
  @ApiResponse({
    status: 201,
    description: 'Challenge started successfully',
    type: UserHabits,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Active challenge already exists' })
  startChallenge(
    @Request() req,
    @Body() startDto: StartHabitChallengeDto,
  ): Promise<UserHabits> {
    return this.habitService.startChallenge(req.user.UID, startDto);
  }

  @Post('/track')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Track habit progress',
    description: 'Track daily progress for a habit challenge',
  })
  @ApiBody({
    type: TrackHabitDto,
    description:
      "Habit tracking data (MODD_FEEDBACK: ['ท้อแท้', 'กดดัน', 'เฉยๆ', 'พอใจ', 'สดใส']) ",
    examples: {
      duration: {
        value: {
          CHALLENGE_ID: 1,
          TRACK_DATE: '2025-02-07',
          DURATION_MINUTES: 30,
          MOOD_FEEDBACK: 'สดใส',
        },
        description: 'Example for duration-based tracking',
      },
      distance: {
        value: {
          CHALLENGE_ID: 1,
          TRACK_DATE: '2025-02-07',
          DISTANCE_KM: 5.5,
          MOOD_FEEDBACK: 'พอใจ',
        },
        description: 'Example for distance-based tracking',
      },
      boolean: {
        value: {
          CHALLENGE_ID: 1,
          TRACK_DATE: '2025-02-07',
          COMPLETED: true,
          MOOD_FEEDBACK: 'เฉยๆ',
        },
        description: 'Example for boolean-based tracking',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Progress tracked successfully',
    type: DailyHabitTrack,
    schema: {
      properties: {
        TRACK_ID: {
          type: 'number',
          description: 'Unique identifier for the track record',
        },
        CHALLENGE_ID: {
          type: 'number',
          description: 'Reference to the habit challenge',
        },
        TRACK_DATE: {
          type: 'string',
          format: 'date',
          description: 'Date of tracking',
        },
        COMPLETED: {
          type: 'boolean',
          description: 'Whether the habit was completed',
        },
        DURATION_MINUTES: {
          type: 'number',
          description: 'Duration in minutes (for duration-based habits)',
          nullable: true,
        },
        DISTANCE_KM: {
          type: 'number',
          description: 'Distance in kilometers (for distance-based habits)',
          nullable: true,
        },
        COUNT_VALUE: {
          type: 'number',
          description: 'Count value (for count-based habits)',
          nullable: true,
        },
        MOOD_FEEDBACK: {
          type: 'string',
          enum: ['ท้อแท้', 'กดดัน', 'เฉยๆ', 'พอใจ', 'สดใส'],
          description: 'Mood feedback for the day',
          nullable: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input or challenge not active',
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  trackHabit(
    @Request() req,
    @Body() trackDto: TrackHabitDto,
  ): Promise<DailyHabitTrack> {
    return this.habitService.trackHabit(req.user.UID, trackDto);
  }

  @Get('/user')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Get user habits',
    description: 'Get list of habits for the current user',
  })
  @ApiQuery({ name: 'status', enum: HabitStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  @ApiQuery({ name: 'pagination', type: Boolean, required: false })
  @ApiResponse({
    status: 200,
    description: 'User habits retrieved successfully',
  })
  getUserHabits(
    @Request() req,
    @Query('status') status?: HabitStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('pagination') pagination?: boolean,
    @Query('isDaily') isDaily?: boolean,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.habitService.getUserHabits(
      req.user.UID,
      status,
      pagination,
      page,
      limit,
      isDaily,
      startDate,
      endDate,
    );
  }

  @Get('/stats/:challengeId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Get habit challenge statistics',
    description: 'Get detailed statistics for a specific habit challenge',
  })
  @ApiParam({
    name: 'challengeId',
    type: Number,
    description: 'ID of the habit challenge',
  })
  @ApiResponse({
    status: 200,
    description: 'Challenge statistics retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Challenge not found' })
  getHabitStats(
    @Request() req,
    @Param('challengeId') challengeId: number,
  ): Promise<any> {
    return this.habitService.getHabitStats(req.user.UID, challengeId);
  }

  @Get('/daily')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({
    summary: 'Get daily habits',
    description: 'Get list of daily habits for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Daily habits retrieved successfully',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              CHALLENGE_ID: {
                type: 'number',
                description: 'Unique identifier for the challenge',
              },
              HID: { type: 'number', description: 'Habit identifier' },
              TITLE: { type: 'string', description: 'Habit title' },
              THUMBNAIL_URL: {
                type: 'string',
                description: 'URL of the habit thumbnail image',
              },
              EXP_REWARD: {
                type: 'number',
                description:
                  'Experience points reward for completing the habit',
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: {
              type: 'number',
              description: 'Total number of daily habits',
            },
          },
        },
      },
    },
  })
  getDaily(@Request() req): Promise<any> {
    return this.habitService.getDailyHabit(req.user.UID);
  }

  @Patch('/noti-set')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  updateUserHabitsNotification(
    @Request() req,
    @Body() dto: updateHabitNotiDto,
  ) {
    return this.habitService.updateUserHabitsNotification(req.user.UID, dto);
  }

  @Get('/history')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getMissionHistory(
    @Request() req,
    @Query('date') date?: string, // YYYY-MM-DD
  ) {
    const dateFormat = new Date(date);
    return this.habitService.getMissionHistory(req.user.UID, dateFormat);
  }

  @Patch('/track')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  updateDailyTrack(@Request() req, @Body() dto: UpdateDailyTrackDto) {
    return this.habitService.updateDailyTrack(dto);
  }

  @Get('mission-stats')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, enum: HabitCategories })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns statistics for habits and quests',
  })
  async getHabitsQuestsStatistics(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('category') category?: HabitCategories,
    @Query('search') search?: string,
  ) {
    return this.habitService.getHabitsQuestsStatistics({
      page: +page,
      limit: +limit,
      category,
      search,
    });
  }
}
