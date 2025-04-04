import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  UploadedFiles,
  BadRequestException,
  Query,
  Request,
} from '@nestjs/common';
import {
  AchievementService,
  TrackAchievementDto,
} from '../services/achievement.service';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { UpdateAchievementBodyDTO } from '../dto/achievement/update_ach.dto';
import { AchievementBodyDTO } from '../dto/achievement/create_ach.dto';
import { dropdownData } from '../interfaces/dropdown.data';
import {
  RequirementEntity,
  TrackableProperty,
} from '@/.typeorm/entities/achievement.entity';
import { UpdateAchievementLevelDto } from '../dto/achievement/updateLevel.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}
  private allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

  @Get('/user-achieveds')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getUserAchieveds(
    @Request() req,
    @Query()
    query?: { userId: number; page?: number; limit?: number; title?: string },
  ) {
    if (!query.userId) {
      query.userId = req.user.UID;
    }
    return this.achievementService.getUserAchieved(query);
  }

  @Get('/user-progresses/:userId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getUserAchProgress(
    @Param('userId') userId: number,
    @Query()
    query: {
      page: number;
      limit: number;
    },
  ) {
    return this.achievementService.getUserAchProgress(
      +userId,
      query.page || 1,
      query.limit || 10,
    );
  }

  @Get('/dropdown')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getEntityDropdown() {
    return {
      data: dropdownData,
    };
  }

  @Get('/level/:id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getAchLevel(@Param('achId') achId: string) {
    return this.achievementService.findAchievementLevels(achId);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'levelIcon0', maxCount: 1 },
      { name: 'levelIcon1', maxCount: 1 },
      { name: 'levelIcon2', maxCount: 1 },
      { name: 'levelIcon3', maxCount: 1 },
      { name: 'levelIcon4', maxCount: 1 },
    ]),
  )
  create(
    @Body() dto: AchievementBodyDTO,
    @UploadedFiles()
    files: { [key: string]: Express.Multer.File[] },
  ) {
    // Attach files to their respective levels
    if (dto.levels && files) {
      dto.levels.forEach((level, index) => {
        const fileKey = `levelIcon${index}`;
        if (files[fileKey]?.[0]) {
          level.file = files[fileKey][0];
        }
      });
    }

    return this.achievementService.create(dto);
  }

  @Patch('/:achId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'levelIcon0', maxCount: 1 },
      { name: 'levelIcon1', maxCount: 1 },
      { name: 'levelIcon2', maxCount: 1 },
      { name: 'levelIcon3', maxCount: 1 },
      { name: 'levelIcon4', maxCount: 1 },
    ]),
  )
  update(
    @Param('achId') achId: string,
    @Body() dto: UpdateAchievementBodyDTO,
    @UploadedFiles()
    files: { [key: string]: Express.Multer.File[] },
  ) {
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        achId,
      )
    ) {
      throw new BadRequestException(`Invalid achievement ID format: ${achId}`);
    }
    // Attach files to their respective levels
    if (dto.levels && files) {
      dto.levels.forEach((level, index) => {
        const fileKey = `levelIcon${index}`;
        if (files[fileKey]?.[0]) {
          level.file = files[fileKey][0];
        }
      });
    }

    return this.achievementService.update(achId, dto);
  }

  @Patch('/level/:achId/:level')
  @Roles(Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async updateAchievementLevel(
    @Param('achId') achId: string,
    @Param('level') level: number,
    @Body() updateAchievementLevelDto: UpdateAchievementLevelDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.achievementService.updateAchievementLevel(
      achId,
      +level,
      updateAchievementLevelDto,
      file,
    );
  }

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  findAll(
    @Query()
    query: {
      page?: number;
      limit?: number;
      title?: string;
    },
  ) {
    query.page = query.page ? Number(query.page) : 1;
    query.limit = query.limit ? Number(query.limit) : 10;
    return this.achievementService.findAll(query);
  }

  @Get('/:achId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  findOne(@Param('achId') achId: string) {
    return this.achievementService.findOne(achId);
  }

  @Delete('/:achId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  remove(@Param('achId') achId: string) {
    return this.achievementService.remove(achId);
  }

  @Post('/track')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  trackProgress(
    @Request() req,
    // @Body()
    // body: {
    //   entity: RequirementEntity;
    //   property: TrackableProperty;
    // },
  ) {
    return this.achievementService.trackProgress({
      uid: req.user.UID,
      value: 1,
      entity: RequirementEntity.USER_LOGIN_STREAK,
      property: TrackableProperty.CURRENT_STREAK,
      date: new Date(
        new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
        }),
      ),
    });
  }

  @Patch('/mark-as-read/:uid/:achId/:level')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  maskAsRead(
    @Request() req,
    @Param('uid') uid: number,
    @Param('achId') achId: string,
    @Param('level') level: number,
  ) {
    return this.achievementService.markAsRead(uid, achId, level);
  }
}
