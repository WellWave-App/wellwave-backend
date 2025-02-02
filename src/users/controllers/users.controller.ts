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

@ApiTags('Users')
@Controller('users')
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.getAll(page, limit);
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        EMAIL: { type: 'string' },
        PASSWORD: { type: 'string' },
      },
      required: ['EMAIL', 'PASSWORD'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('/register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
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
  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.UID);
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'uid', type: 'number', description: 'User ID' })
  @ApiResponse({ status: 200, type: CreateUserDto })
  @ApiResponse({ status: 404, description: 'User not found' })
  @UseGuards(JwtAuthGuard)
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
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('imgFile'))
  @Patch('/:uid')
  update(
    @Request() req,
    @Param('uid') UID: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile(imageFileValidator)
    file?: Express.Multer.File,
  ) {
    if (req.user.UID !== +UID) {
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
  @UseGuards(JwtAuthGuard)
  @Delete('/:uid')
  remove(@Param('uid') UID: string) {
    return this.usersService.remove(+UID);
  }

  @Get('/profile-deep/:uid')
  getDeepProfiler(
    @Param('uid') uid: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getDeepProfile(uid, page, limit);
  }

  @Get('/health-history/:uid')
  getHealthHistory(
    @Param('uid') uid: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
    @Query('type') type: 'graph_log' | 'mission' | 'health_log',
    @Query('toDate') toDate?: Date,
    @Query('fromDate') fromDate?: Date,
    @Query('sortLogBy') sortLogBy?: 'date' | 'log_name' | 'log_status',
    @Query('sortMissionBy')
    sortMissionBy?: 'date' | 'mission_type' | 'activity_type',
    @Query('order') order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const defaultToDate = new Date();
    const oneMonthAgo = new Date(defaultToDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    return this.usersService.getHealthHistory(
      uid,
      page,
      limit,
      type,
      new Date(fromDate) || defaultToDate,
      new Date(toDate) || oneMonthAgo,
      sortLogBy,
      sortMissionBy,
      order,
    );
  }
}
