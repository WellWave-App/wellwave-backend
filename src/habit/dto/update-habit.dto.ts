import { PartialType } from '@nestjs/swagger';
import { CreateHabitDto } from './create-habit.dto';
import {
  DIFFICULTY_LEVEL,
  HABIT_TYPE,
} from 'src/.typeorm/entities/habit.entity';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {}
