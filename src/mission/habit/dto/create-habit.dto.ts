import {
  Conditions,
  ExerciseType,
  HabitCategories,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsString,
  IsOptional,
  ValidateNested,
  IsNumber,
  Min,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class CreateHabitDto {
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
  DESCRIPTION?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  ADVICE?: string;

  @IsEnum(HabitCategories)
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  CATEGORY: HabitCategories;

  @IsEnum(ExerciseType)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  EXERCISE_TYPE?: ExerciseType;

  @IsEnum(TrackingType)
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TRACKING_TYPE: TrackingType;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  EXP_REWARD?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  GEM_REWARD?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  DEFAULT_DAILY_MINUTE_GOAL?: number;

  @IsInt()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  DEFAULT_DAYS_GOAL?: number;

  // @ValidateNested()
  @IsObject()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  CONDITIONS?: Conditions;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  THUMBNAIL_URL?: string;

  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Boolean(value),
  )
  @IsOptional()
  @IsBoolean()
  IS_DAILY: boolean;

  @IsOptional({ message: 'Thumbnail image must not empty' })
  file?: any;
}
