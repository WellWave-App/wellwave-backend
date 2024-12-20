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
  UseGuards,
} from '@nestjs/common';
import { LoginStreakService } from '../services/login-streak.service';
import { CreateLoginStreakDto } from '../dto/create-login-streak.dto';
import { UpdateLoginStreakDto } from '../dto/update-login-streak.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';

@Controller('login-streak')
export class LoginStreakController {
  constructor(private readonly loginStreakService: LoginStreakService) {}

  @Get(':uid/login-history-stats')
  async getLoginHistoryStats(
    @Param('uid') uid: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const daysToMonday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    start.setDate(today.getDate() - daysToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday

    // const startDate
    const dateStart = startDate ? new Date(startDate) : start;
    const dateEnd = endDate ? new Date(endDate) : end;

    return await this.loginStreakService.getUserLoginHistoryStats(
      uid,
      dateStart,
      dateEnd,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('update-login')
  loggedIn(@Request() req) {
    return this.loginStreakService.updateUserLoginStreak(+req.user.UID);
    // return req.user;
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
}
