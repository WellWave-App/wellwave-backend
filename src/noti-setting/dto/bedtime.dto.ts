import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class BedtimeDTO {
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  BEDTIME?: string;

  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  @IsOptional()
  WAKE_TIME?: string;
}
