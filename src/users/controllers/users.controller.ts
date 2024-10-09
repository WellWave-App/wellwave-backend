import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from '../dto/register.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }

  @Get(':uid')
  findOne(@Param('uid') UID: string) {
    return this.usersService.findOne(+UID);
  }

  @Patch(':uid')
  update(@Param('uid') UID: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+UID, updateUserDto);
  }

  @Delete(':uid')
  remove(@Param('uid') UID: string) {
    return this.usersService.remove(+UID);
  }
}
