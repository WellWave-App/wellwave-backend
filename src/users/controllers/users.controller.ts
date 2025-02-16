import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  ForbiddenException,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
  ApiBearerAuth,
  ApiProperty,
} from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { RegisterUserDto } from '../dto/register.dto';
import { order, userSortList } from '../interfaces/user-list.interface';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { imageFileValidator } from '@/image/imageFileValidator';
import { DateService } from '@/helpers/date/date.services';

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly dateService: DateService,
  ) {}

  @ApiOperation({ summary: 'Get users list with search and sorting options' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by UID',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: [
      'uid',
      'hypertension',
      'diabetes',
      'obesity',
      'dyslipidemia',
      'last_login',
      'complete_rate',
      'streak',
    ],
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of users with additional information',
    schema: {
      properties: {
        data: {
          type: 'array',
          items: {
            properties: {
              UID: { type: 'number' },
              USERNAME: { type: 'string' },
              EMAIL: { type: 'string' },
              RISK_ASSESSMENT: {
                type: 'object',
                properties: {
                  DIABETES: { type: 'number' },
                  HYPERTENSION: { type: 'number' },
                  DYSLIPIDEMIA: { type: 'number' },
                  OBESITY: { type: 'number' },
                },
              },
              COMPLETE_RATE: { type: 'number' },
              LOGIN_STATS: {
                type: 'object',
                properties: {
                  LOGIN_STREAK: { type: 'number' },
                  LASTED_LOGIN: { type: 'string', format: 'date-time' },
                  STREAK_START: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('/lists')
  async getUserLists(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: userSortList,
    @Query('order') order?: order,
  ) {
    return this.usersService.getUserLists(
      page || 1,
      limit || 10,
      search,
      sortBy,
      order,
    );
  }

  @ApiOperation({ summary: 'Get all users with pagination' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of users with pagination',
    schema: {
      properties: {
        USERS: {
          type: 'array',
          items: { $ref: '#/components/schemas/UserEntity' },
        },
        total: {
          type: 'number',
          description: 'Total number of users',
        },
      },
    },
  })
  @Get()
  @Roles(Role.MODERATOR, Role.ADMIN)
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.getAll(page, limit);
  }

  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile with additional information',
    schema: {
      properties: {
        userInfo: { $ref: '#/components/schemas/UserEntity' },
        userLeague: {
          type: 'object',
          properties: {
            LB_ID: { type: 'number' },
            LEAGUE_NAME: { type: 'string' },
            MIN_EXP: { type: 'number' },
            MAX_EXP: { type: 'number' },
          },
        },
        loginStats: { type: 'object' },
        usersAchievement: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              imgPath: { type: 'string' },
              achTitle: { type: 'string' },
              dateAcheived: { type: 'string' },
            },
          },
        },
      },
    },
  })
  @Roles(Role.MODERATOR, Role.ADMIN, Role.USER)
  @Get('/profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.UID);
  }

  @Get('/logs-progress')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({ summary: 'Get mission logs with date range' })
  @ApiQuery({ name: 'fromDate', required: false, type: String })
  @ApiQuery({ name: 'toDate', required: false, type: String })
  async getMissionLogs(
    @Request() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    // try {
    const now = this.dateService.getCurrentDate().date;
    const defaultFromDate = new Date(now);
    defaultFromDate.setMonth(defaultFromDate.getMonth() - 6);
    defaultFromDate.setHours(0, 0, 0, 0);

    let from = defaultFromDate;
    let to = new Date(now);

    if (fromDate && toDate) {
      from = new Date(fromDate);
      to = new Date(toDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Invalid date format');
      }

      if (from > to) {
        throw new BadRequestException('fromDate must be before toDate');
      }

      const oneYearAgo = new Date(now);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (from < oneYearAgo) {
        throw new BadRequestException('Date range cannot exceed 1 year');
      }
    }

    to.setHours(23, 59, 59, 999);
    return await this.usersService.getMissionLogs(req.user.UID, from, to);
    // } catch (error) {
    //   if (error instanceof BadRequestException) throw error;
    //   throw new InternalServerErrorException('Error fetching mission logs');
    // }
  }

  // @Get('/weekly-progress')
  // @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  // @ApiOperation({ summary: 'Get mission weekly progress with date range' })
  // async getWeeklyMissionProgress(@Request() req) {
  //   return await this.usersService.getWeeklyMissionProgress(req.user.UID);
  // }

  @Get('/weekly-progress')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @ApiOperation({ summary: 'Get mission progress with date range' })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: String,
    description: 'Start date (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: String,
    description: 'End date (YYYY-MM-DD)',
  })
  async getMissionProgress(
    @Request() req,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
  ) {
    const { startOfWeek, endOfWeek } = this.dateService.getCurrentWeekRange();
    let from: Date = startOfWeek;
    let to: Date = endOfWeek;

    if (fromDate && toDate) {
      from = new Date(fromDate);
      to = new Date(toDate);

      if (isNaN(from.getTime()) || isNaN(to.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD');
      }

      from.setHours(0, 0, 0, 0);
      to.setHours(23, 59, 59, 999);

      if (from > to) {
        throw new BadRequestException('fromDate must be before toDate');
      }

      const today = this.dateService.getCurrentDate();
      const oneYearAgo = new Date(today.date);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (from < oneYearAgo) {
        throw new BadRequestException('Date range cannot exceed 1 year');
      }
    }

    return await this.usersService.getWeeklyMissionProgress(
      req.user.UID,
      from,
      to,
    );
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.MODERATOR, Role.ADMIN, Role.USER)
  @Get('/:uid')
  findOne(@Param('uid') UID: string) {
    return this.usersService.getById(+UID);
  }

  @ApiOperation({ summary: 'Update user profile' })
  @ApiConsumes('multipart/form-data')
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        imgFile: {
          type: 'string',
          format: 'binary',
          description: 'Profile image file (JPEG/PNG/GIF, max 10MB)',
        },
        ...Object.fromEntries(
          Object.entries(UpdateUserDto.prototype).map(([key]) => [
            key,
            { type: 'string' },
          ]),
        ),
      },
    },
  })
  @ApiResponse({ status: 200, type: UpdateUserDto })
  @ApiResponse({
    status: 403,
    description: 'Forbidden: Can only update own profile',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseInterceptors(FileInterceptor('imgFile'))
  @Roles(Role.MODERATOR, Role.ADMIN, Role.USER)
  @Patch('/:uid')
  update(
    @Request() req,
    @Param('uid') UID: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(imageFileValidator)
    file?: Express.Multer.File,
  ) {
    if (req.user.UID !== +UID && req.user.ROLE === Role.USER) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(+UID, updateUserDto, file);
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.MODERATOR, Role.ADMIN, Role.USER)
  @Delete('/:uid')
  remove(@Param('uid') UID: string) {
    return this.usersService.remove(+UID);
  }

  @ApiOperation({ summary: 'Get detailed user profile' })
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns detailed user profile information',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            UID: { type: 'number' },
            USERNAME: { type: 'string' },
            EMAIL: { type: 'string' },
            AGE: { type: 'number' },
            RISK_ASSESSMENT: {
              type: 'object',
              properties: {
                DIABETES: { type: 'number' },
                HYPERTENSION: { type: 'number' },
                DYSLIPIDEMIA: { type: 'number' },
                OBESITY: { type: 'number' },
              },
            },
            LOGIN_STATS: {
              type: 'object',
              properties: {
                LOGIN_STREAK: { type: 'number' },
                LASTED_LOGIN: { type: 'string', format: 'date-time' },
                STREAK_START: { type: 'string', format: 'date-time' },
              },
            },
            COMPLETE_RATE: {
              type: 'object',
              properties: {
                OVERALL_PERCENTAGE: { type: 'number' },
                MISSTION_TYPES: {
                  type: 'object',
                  properties: {
                    DAILY_HABIT: { type: 'number' },
                    HABIT: { type: 'number' },
                    QUEST: { type: 'number' },
                  },
                },
                ACTIVITY_TYPES: {
                  type: 'object',
                  properties: {
                    EXERCISE: { type: 'number' },
                    SLEEP: { type: 'number' },
                    DIET: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('/profile-deep/:uid')
  getDeepProfiler(
    @Param('uid') uid: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getDeepProfile(uid, page, limit);
  }

  @ApiOperation({ summary: 'Get user health history' })
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiQuery({
    name: 'type',
    required: true,
    enum: ['graph_log', 'mission', 'health_log'],
    description: 'Type of health history to retrieve',
  })
  @ApiQuery({
    name: 'toDate',
    required: false,
    type: Date,
    description: 'End date for history (default: current date)',
  })
  @ApiQuery({
    name: 'fromDate',
    required: false,
    type: Date,
    description: 'Start date for history (default: one month ago)',
  })
  @ApiQuery({
    name: 'sortLogBy',
    required: false,
    enum: ['date', 'log_name', 'log_status'],
    description: 'Sort field for health logs',
  })
  @ApiQuery({
    name: 'sortMissionBy',
    required: false,
    enum: ['date', 'mission_type', 'activity_type'],
    description: 'Sort field for missions',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    enum: ['ASC', 'DESC'],
    description: 'Sort order',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user health history based on specified type',
    schema: {
      properties: {
        data: {
          type: 'object',
          properties: {
            graph_log: { type: 'object', nullable: true },
            mission: {
              type: 'array',
              items: {
                properties: {
                  date: { type: 'string' },
                  missionType: { type: 'string' },
                  activityType: { type: 'string' },
                  detail: { type: 'string' },
                  status: { type: 'string' },
                },
              },
              nullable: true,
            },
            health_log: {
              type: 'array',
              items: { type: 'object' },
              nullable: true,
            },
          },
        },
        meta: {
          type: 'object',
          nullable: true,
          properties: {
            total: { type: 'number' },
            page: { type: 'number' },
            limit: { type: 'number' },
            totalPages: { type: 'number' },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @Roles(Role.MODERATOR, Role.ADMIN)
  @Get('/health-history/:uid')
  getHealthHistory(
    @Param('uid') uid: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('type') type: 'graph_log' | 'mission' | 'health_log',
    @Query('toDate') toDate?: Date,
    @Query('fromDate') fromDate?: Date,
    @Query('sortLogBy') sortLogBy?: 'date' | 'log_name' | 'log_status',
    @Query('sortMissionBy')
    sortMissionBy?: 'date' | 'mission_type' | 'activity_type',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return this.usersService.getHealthHistory(
      uid,
      page || 1,
      limit || 10,
      type,
      new Date(fromDate) || today,
      new Date(toDate) || oneMonthAgo,
      sortLogBy || 'date',
      sortMissionBy || 'date',
      order || 'ASC',
    );
  }
}
