import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { HabitService } from './habit.service';
import {
  StartHabitDto,
  CompleteHabitDto,
  HabitFilterType,
} from './dto/habit.dto';
import { JwtAuthGuard } from '../auth//guard/jwt-auth.guard';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitController {
  constructor(private readonly habitService: HabitService) {}

  @Get(':userId/available')
  getAvailableHabits(
    @Param('userId') userId: number,
    @Body() medicalConditions: any,
    @Query('filter') filterType: HabitFilterType = HabitFilterType.ALL,
  ) {
    return this.habitService.getAvailableHabits(
      userId,
      medicalConditions,
      filterType,
    );
  }

  @Get(':userId/active')
  getUserActiveHabits(@Param('userId') userId: number) {
    return this.habitService.getUserActiveHabits(userId);
  }

  @Post('start')
  startHabit(@Body() startHabitDto: StartHabitDto) {
    return this.habitService.startHabit(startHabitDto);
  }

  @Post('complete')
  completeHabit(@Body() completeHabitDto: CompleteHabitDto) {
    return this.habitService.completeHabit(completeHabitDto);
  }

  @Get(':userId/habit/:habitId/stats')
  getHabitStats(
    @Param('userId') userId: number,
    @Param('habitId') habitId: number,
  ) {
    return this.habitService.getUserHabitStats(userId, habitId);
  }
}
