import { IsBoolean, IsEnum, IsNumber, IsString, Max, Min } from 'class-validator';
import {
  DIFFICULTY_LEVEL,
  HABIT_TYPE,
} from 'src/.typeorm/entities/habit.entity';

export class CreateHabitDto {
  @IsString()
  HABIT_TITLE: string;

  @IsString()
  DESCRIPTION: string;

  @IsEnum(HABIT_TYPE)
  HABIT_TYPE: HABIT_TYPE;

  @IsString()
  HABIT_ADVICE: string;

  @IsNumber()
  @Min(0)
  EXP_REWARD: number;

  @IsNumber()
  @Min(0)
  GEM_REWARD: number;

  @IsBoolean()
  DIABETES_CONDITION: boolean;

  @IsBoolean()
  OBESITY_CONDITION: boolean;

  @IsBoolean()
  DYSLIPIDEMIA_CONDITION: boolean;

  @IsBoolean()
  HYPERTENSION_CONDITION: boolean;

  @IsNumber()
  @Min(1)
  @Max(3)
  DIFFICULTY_LEVEL: number;
}
