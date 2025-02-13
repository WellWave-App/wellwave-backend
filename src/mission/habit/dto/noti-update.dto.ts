import { Weekdays } from '@/.typeorm/entities/noti-bedtime-setting.entity';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
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

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  NOTI_TIME?: string;
}
