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
} from '@nestjs/common';
import { AchievementService } from '../services/achievement.service';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
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

@Controller('achievement')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createAchievementDto: CreateAchievementDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ) {
    return this.achievementService.create(createAchievementDto, file);
  }

  @Get()
  findAll(
    @Param('query')
    query: {
      page?: number;
      limit?: number;
      searchTitle?: string;
    },
  ) {
    return this.achievementService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.achievementService.findOne(id);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id') id: string,
    @Body() updateAchievementDto: UpdateAchievementDto,
    @UploadedFile(imageFileValidator) file?: Express.Multer.File,
  ) {
    return this.achievementService.update(id, updateAchievementDto, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.achievementService.remove(id);
  }
}
