import { Weekdays } from '@/.typeorm/entities/noti-bedtime-setting.entity';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
} from 'class-validator';

export class updateHabitNotiDto {
  @IsNotEmpty()
  @IsNumber()
  CHALLENGE_ID: number;

  @IsBoolean()
  @IsOptional()
  IS_NOTIFICATION_ENABLED?: boolean;

  @IsOptional()
  @IsObject()
  WEEKDAYS_NOTI?: Weekdays;
}
