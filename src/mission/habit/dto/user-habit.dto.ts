import { Weekdays } from '@/.typeorm/entities/noti-bedtime-setting.entity';
import { HabitStatus } from '@/.typeorm/entities/user-habits.entity';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';

export class StartHabitChallengeDto {
  // @IsNotEmpty()
  @IsOptional()
  @IsInt()
  UID: number;

  @IsInt()
  @IsNotEmpty()
  HID: number;

  @IsInt()
  @IsOptional()
  DAILY_MINUTE_GOAL?: number;

  @IsInt()
  @IsOptional()
  DAYS_GOAL?: number;

  @IsBoolean()
  @IsOptional()
  IS_NOTIFICATION_ENABLED?: boolean;

  @IsObject()
  @IsOptional()
  WEEKDAYS_NOTI?: Weekdays;
}

export class UpdateUserHabitDto extends StartHabitChallengeDto {
  @IsInt()
  @IsNotEmpty()
  CHALLENGE_ID: number;

  @IsDate()
  @IsOptional()
  START_DATE?: Date;

  @IsDate()
  @IsOptional()
  END_DATE?: Date;

  @IsInt()
  @IsOptional()
  DAILY_MINUTE_GOAL?: number;

  @IsInt()
  @IsOptional()
  DAYS_GOAL?: number;

  @IsBoolean()
  @IsOptional()
  IS_NOTIFICATION_ENABLED?: boolean;

  @IsObject()
  // @ValidateNested()
  // @Type(() => WeekdaysValidator)
  @IsOptional()
  WEEKDAYS_NOTI?: Weekdays;

  @IsOptional()
  @IsEnum(HabitStatus)
  STATUS?: string;

  @IsOptional()
  STREAK_COUNT?: number;
}

export class WeekdaysValidator implements Weekdays {
  @IsBoolean()
  Sunday: boolean;

  @IsBoolean()
  Monday: boolean;

  @IsBoolean()
  Tuesday: boolean;

  @IsBoolean()
  Wednesday: boolean;

  @IsBoolean()
  Thursday: boolean;

  @IsBoolean()
  Friday: boolean;

  @IsBoolean()
  Saturday: boolean;
}
