import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

export class WaterPlanDTO {
  @IsNumber()
  @IsNotEmpty()
  UID: number;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  GLASS_NUMBER: number;

  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Time must be in HH:mm format (00:00-23:59)',
  })
  NOTI_TIME?: string;

  @IsBoolean()
  @IsOptional()
  IS_ACTIVE?: boolean;
}
