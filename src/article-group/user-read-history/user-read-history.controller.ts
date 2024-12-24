import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserReadHistoryService } from './user-read-history.service';
import { CreateUserReadHistoryDto } from './dto/create-user-read-history.dto';
import { UpdateUserReadHistoryDto } from './dto/update-user-read-history.dto';

@Controller('user-read-history')
export class UserReadHistoryController {
  constructor(private readonly userReadHistoryService: UserReadHistoryService) {}

  @Post()
  create(@Body() createUserReadHistoryDto: CreateUserReadHistoryDto) {
    return this.userReadHistoryService.create(createUserReadHistoryDto);
  }

  @Get()
  findAll() {
    return this.userReadHistoryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userReadHistoryService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserReadHistoryDto: UpdateUserReadHistoryDto) {
    return this.userReadHistoryService.update(+id, updateUserReadHistoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userReadHistoryService.remove(+id);
  }
}
