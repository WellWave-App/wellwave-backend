import { PartialType } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class WaterRangeDTO {
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  START_TIME?: string;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  END_TIME?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  GLASSES_PER_DAY?: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  INTERVAL_MINUTES?: number;

  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;
}
