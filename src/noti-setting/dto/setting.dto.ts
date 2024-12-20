// bedtime.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class BedtimeDTO {
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @ApiPropertyOptional({
    description: 'Whether bedtime notifications are active',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;

  @ApiPropertyOptional({
    description: 'Bedtime in HH:mm format',
    example: '22:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  BEDTIME?: string;

  @ApiPropertyOptional({
    description: 'Wake time in HH:mm format',
    example: '06:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  WAKE_TIME?: string;
}

// water-range.dto.ts
export class WaterRangeDTO {
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @ApiPropertyOptional({
    description: 'Whether water range notifications are active',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;

  @ApiPropertyOptional({
    description: 'Start time for water notifications in HH:mm format',
    example: '08:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  START_TIME?: string;

  @ApiPropertyOptional({
    description: 'End time for water notifications in HH:mm format',
    example: '20:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  END_TIME?: string;

  @ApiPropertyOptional({
    description: 'Number of glasses of water per day',
    example: 8,
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  GLASSES_PER_DAY?: number;

  @ApiPropertyOptional({
    description: 'Interval between notifications in minutes',
    example: 60,
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  INTERVAL_MINUTES?: number;
}

// water-plan.dto.ts
export class WaterPlanDTO {
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @ApiPropertyOptional({
    description: 'Glass number for this notification',
    example: 1,
    minimum: 1
  })
  @IsNumber()
  @IsOptional()
  GLASS_NUMBER: number;

  @ApiPropertyOptional({
    description: 'Notification time in HH:mm format',
    example: '09:00'
  })
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  NOTI_TIME?: string;

  @ApiPropertyOptional({
    description: 'Whether water plan notifications are active',
    example: true
  })
  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;
}