import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { APP_ROUTE } from '../../.typeorm/entities/notification_history.entity';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsNumber,
} from 'class-validator';

// Helper function for handling empty values
const handleEmpty = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// Helper function for handling numbers
const parseNumber = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export class CreateNotificationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  IMAGE_URL?: string;

  @ApiProperty()
  @IsString()
  @Transform(({ value }) => handleEmpty(value))
  MESSAGE: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  IS_READ?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  FROM?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  TO?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  APP_ROUTE?: APP_ROUTE;

  @ApiProperty()
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  UID?: number;

  @IsOptional()
  file?: any;
}
