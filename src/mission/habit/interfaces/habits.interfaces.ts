import { HabitCategories } from '@/.typeorm/entities/habit.entity';
import { HabitStatus } from '@/.typeorm/entities/user-habits.entity';
import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  IsString,
  IsNumber,
  Max,
  IsBoolean,
} from 'class-validator';

export enum CategoriesFilters {
  All = 'all',
  Parent = 'parent',
  Sub = 'sub',
}

export class CategoriesParamsDto {
  @IsOptional()
  @Type(() => Number) // Transform query parameter to a number
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsEnum(CategoriesFilters)
  filter?: CategoriesFilters;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Boolean) // Transform query parameter to a boolean
  pagination?: boolean;
}

export enum HabitFilterStatus {
  All = 'all',
  Doing = 'doing',
  NotDoing = 'sub',
}

export class HabitsParamsDto {
  @IsOptional()
  @Type(() => Number) // Transform query parameter to a number
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsNumber()
  filterCategoryId?: number;

  @IsOptional()
  @IsEnum(HabitFilterStatus)
  filterStatus?: HabitFilterStatus;

  @IsOptional()
  @IsString()
  query?: string;

  @IsOptional()
  @Type(() => Boolean) // Transform query parameter to a boolean
  pagination?: boolean;
}

export class QueryHabitsDto {
  // Pagination
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsEnum(HabitCategories)
  filterCategory?: HabitCategories;

  @IsOptional()
  @IsEnum(HabitStatus)
  filterHabitStatus?: HabitStatus;

  @IsOptional()
  @IsString()
  query?: string; // Changed from number to string for query search

  @IsOptional()
  @IsBoolean()
  pagination?: boolean;
}

export enum HabitListFilter {
  ALL = 'all',
  DOING = 'doing',
  NOT_DOING = 'not-doing'
}