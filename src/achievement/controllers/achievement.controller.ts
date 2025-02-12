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
} from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { UpdateAchievementBodyDTO } from '../dto/achievement/update_ach.dto';
import { AchievementBodyDTO } from '../dto/achievement/create_ach.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}
  private allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

  @Get('/level/:id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  getAchLevel(@Param('achId') achId: string) {
    return { data: this.achievementService.findAchievementLevels(achId) };
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

    return { data: this.achievementService.create(dto) };
  }

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR)
  findAll(
    @Query()
    query?: {
      page?: number;
      limit?: number;
      title?: string;
    },
  ) {
    query.page = query.page ? Number(query.page) : 1;
    query.limit = query.limit ? Number(query.limit) : 10;
    return this.achievementService.findAll(query);
  }

  @Get(':achId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  findOne(@Param('achId') achId: string) {
    return this.achievementService.findOne(achId);
  }

  @Patch(':achId')
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
    @UploadedFile()
    files: { [key: string]: Express.Multer.File[] },
  ) {
    // Attach files to their respective levels
    if (dto.levels && files) {
      dto.levels.forEach((level, index) => {
        const fileKey = `levelIcon${index}`;
        if (!this.allowedTypes.includes(files[fileKey]?.[0].mimetype)) {
          throw new BadRequestException(
            `Invalid file type: ${files[fileKey]?.[0].mimetype}. Only JPEG, PNG, JPG, and GIF are allowed.`,
          );
        }
        if (files[fileKey]?.[0]) {
          level.file = files[fileKey][0];
        }
      });
    }

    return { data: this.achievementService.update(achId, dto) };
  }

  @Delete(':achId')
  @Roles(Role.ADMIN, Role.MODERATOR)
  remove(@Param('achId') achId: string) {
    return this.achievementService.remove(achId);
  }
}
