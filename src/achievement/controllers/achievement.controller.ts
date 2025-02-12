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
  FileTypeValidator,
  MaxFileSizeValidator,
  ParseFilePipe,
  UseGuards,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { UpdateAchievementBodyDTO } from '../dto/achievement/update_ach.dto';
import { AchievementBodyDTO } from '../dto/achievement/create_ach.dto';
import { imageFileValidator } from '@/image/imageFileValidator';
import { plainToClass } from 'class-transformer';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}
  private allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];

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

  @Get()
  @Roles(Role.ADMIN, Role.MODERATOR)
  findAll(
    @Param('query')
    query: {
      page?: number;
      limit?: number;
      searchTitle?: string;
    },
  ) {
    return this.achievementService.findAll({
      page: query.page ? Number(query.page) : 1,
      limit: query.limit ? Number(query.limit) : 10,
      searchTitle: query.searchTitle,
    });
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  findOne(@Param('id') id: string) {
    return this.achievementService.findOneOrNull(id);
  }

  @Patch(':id')
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
    @Param('id') id: string,
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

    return this.achievementService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MODERATOR)
  remove(@Param('id') id: string) {
    return this.achievementService.remove(id);
  }
}
