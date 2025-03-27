import {
  DailyStatus,
  Moods,
} from '@/.typeorm/entities/daily-habit-track.entity';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class TrackHabitDto {
  @IsNotEmpty()
  @IsNumber()
  CHALLENGE_ID: number;

  @IsOptional()
  TRACK_DATE?: string;

  @IsNumber()
  @IsOptional()
  DURATION_MINUTES?: number;

  @IsNumber()
  @IsOptional()
  DISTANCE_KM?: number;

  @IsNumber()
  @IsOptional()
  COUNT_VALUE?: number;

  @IsBoolean()
  @IsOptional()
  COMPLETED?: boolean;

  // @IsOptional()
  // STATUS?: DailyStatus;

  // @IsOptional()
  // MINUTES_SPENT?: number;

  @IsOptional()
  MOOD_FEEDBACK?: Moods;
}

export class UpdateDailyTrackDto extends PartialType(TrackHabitDto) {
  STATUS?: DailyStatus;
  MINUTES_SPENT?: number;
  MOOD_FEEDBACK?: Moods;
}
