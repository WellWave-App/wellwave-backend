import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEmail, IsISO8601, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  USERNAME?: string;

  @IsEmail()
  @IsOptional()
  EMAIL?: string;

  @IsISO8601()
  @IsOptional()
  @Type(() => Date)
  YEAR_OF_BIRTH?: Date;

  @IsBoolean()
  @IsOptional()
  GENDER?: boolean;

  @IsNumber()
  @IsOptional()
  HEIGHT?: number;

  @IsNumber()
  @IsOptional()
  WEIGHT?: number;

  @IsNumber()
  @IsOptional()
  GEM?: number;

  @IsNumber()
  @IsOptional()
  EXP?: number;

  @IsNumber()
  @IsOptional()
  WEIGHT_goal?: number;

  @IsString()
  @IsOptional()
  REMINDER_NOTI_TIME?: string;
}