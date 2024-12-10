import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HabitService } from './habit.service';
import {
  StartHabitDto,
  CompleteHabitDto,
  HabitFilterType,
} from './dto/habit.dto';
import { JwtAuthGuard } from '../auth//guard/jwt-auth.guard';
import { CreateHabitDto } from './dto/create-habit.dto';

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

  @Get(':userId/active/:habitId')
  async getUserActiveHabitDetail(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('habitId', ParseIntPipe) habitId: number,
  ) {
    return this.habitService.getUserActiveHabitDetail(userId, habitId);
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

  @Post()
  createHabit(@Body() createHabitdto: CreateHabitDto) {
    return this.habitService.createHabit(createHabitdto);
  }

  @Get()
  getAllHabits(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.habitService.findAll(page, limit);
  }
}
