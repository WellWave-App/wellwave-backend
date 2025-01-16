import { Module } from '@nestjs/common';
import { HabitService } from './habit.service';
import { HabitController } from './habit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitCategories } from '../../.typeorm/entities/habit-categories.entity';
import { Habits } from '../../.typeorm/entities/habit.entity';
import { UserHabits } from '../../.typeorm/entities/user-haits.entity';
import { DailyHabitTrack } from '../../.typeorm/entities/daily-habit-track.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HabitCategories,
      Habits,
      UserHabits,
      DailyHabitTrack,
    ]),
  ],
  controllers: [HabitController],
  providers: [HabitService],
})
export class HabitModule {}
