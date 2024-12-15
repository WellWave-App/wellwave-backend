import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
} from '@nestjs/common';
import { LoginStreakService } from './login-streak.service';
import { CreateLoginStreakDto } from './dto/create-login-streak.dto';
import { UpdateLoginStreakDto } from './dto/update-login-streak.dto';

@Controller('login-streak')
export class LoginStreakController {
  constructor(private readonly loginStreakService: LoginStreakService) {}

  @Get(':uid/login-history-stats')
  async getLoginHistoryStats(
    @Param('uid') uid: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.loginStreakService.getUserLoginHistoryStats(
      uid,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Post()
  create(@Body() createLoginStreakDto: CreateLoginStreakDto) {
    return this.loginStreakService.createLoginStreak(createLoginStreakDto);
  }

  @Get()
  findAll() {
    return this.loginStreakService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.loginStreakService.findOne(+uid);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLoginStreakDto: UpdateLoginStreakDto,
  ) {
    return this.loginStreakService.update(+id, updateLoginStreakDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loginStreakService.remove(+id);
  }

  @Post()
  loggedIn(@Request() req) {
    return this.loginStreakService.updateUserLoginStreak(+req.UID);
  }
}
