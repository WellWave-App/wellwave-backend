import {
  ExerciseType,
  HabitCategories,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { QuestType } from '@/.typeorm/entities/quest.entity';
import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateQuestDto {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TITLE: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  IMG_URL?: string;

  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  DAY_DURATION: number;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  DESCRIPTION: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  EXP_REWARDS?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  GEM_REWARDS?: number;

  @IsEnum(HabitCategories)
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  RELATED_HABIT_CATEGORY: HabitCategories;

  @ApiPropertyOptional({ enum: ExerciseType, description: 'Type of exercise' })
  @IsEnum(ExerciseType)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  EXERCISE_TYPE?: ExerciseType;

  @ApiProperty({ enum: TrackingType, description: 'Type of tracking for the quest' })
  @IsEnum(TrackingType)
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TRACKING_TYPE: TrackingType;

  @ApiPropertyOptional({
    enum: QuestType,
    description: 'Type of quest',
    default: QuestType.NORMAL,
  })
  @IsEnum(QuestType)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  QUEST_TYPE?: QuestType = QuestType.NORMAL;

  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  RQ_TARGET_VALUE: number;

  // @IsOptional()
  // @Transform(({ value }: TransformFnParams) =>
  //   value === '' ? undefined : value,
  // )
  // RQ_TARGET_MINUTES?: number; // for general exercise based quest

  // @IsOptional()
  // @IsNumber()
  // @Transform(({ value }: TransformFnParams) =>
  //   value === '' ? undefined : value,
  // )
  // RQ_TARGET_KM_DISTANCE?: number; // for exercise that can measure distance

  // @IsOptional()
  // @IsNumber()
  // @Transform(({ value }: TransformFnParams) =>
  //   value === '' ? undefined : value,
  // )
  // RQ_TARGET_DAYS_STREAK?: number; // for streak-based quests (can be use with all category)

  // @IsNumber()
  // @IsOptional()
  // @Transform(({ value }: TransformFnParams) =>
  //   value === '' ? undefined : value,
  // )
  // RQ_TARGET_COUNT?: number; // for count-based categories

  @IsOptional()
  file?: any;
}
