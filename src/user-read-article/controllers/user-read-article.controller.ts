import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserReadArticleService } from '../services/user-read-article.service';
import { CreateUserReadArticleDto } from '../dto/create-user-read-article.dto';
import { UpdateUserReadArticleDto } from '../dto/update-user-read-article.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Article')
@Controller('user-read-article')
export class UserReadArticleController {
  constructor(
    private readonly userReadArticleService: UserReadArticleService,
  ) {}

  @Post()
  create(@Body() createUserReadArticleDto: CreateUserReadArticleDto) {
    return this.userReadArticleService.create(createUserReadArticleDto);
  }

  @Get()
  findAll() {
    return this.userReadArticleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userReadArticleService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserReadArticleDto: UpdateUserReadArticleDto,
  ) {
    return this.userReadArticleService.update(+id, updateUserReadArticleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userReadArticleService.remove(+id);
  }
}
