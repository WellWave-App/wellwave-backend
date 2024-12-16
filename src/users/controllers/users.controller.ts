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
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { UpdateUserDto } from '../dto/update-user.dto';
import { ApiTags } from '@nestjs/swagger';
// import { RegisterUserDto } from '../dto/register.dto';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateUserDto } from '../dto/create-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/register')
  create(@Body() registerUserDto: CreateUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/profile')
  async getProfile(@Request() req) {
    // const user = await this.usersService.findOneByEmail(req.user.EMAIL);
    // return req.user.UID;
    return this.usersService.getProfile(req.user.UID);
  }

  @Get()
  findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.usersService.findAll(page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':uid')
  findOne(@Param('uid') UID: string) {
    return this.usersService.findOne(+UID);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':uid')
  update(
    @Request() req,
    @Param('uid') UID: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    if (req.user.UID !== +UID) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return this.usersService.update(+UID, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':uid')
  remove(@Param('uid') UID: string) {
    return this.usersService.remove(+UID);
  }
}
