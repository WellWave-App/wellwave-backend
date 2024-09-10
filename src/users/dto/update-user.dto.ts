import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsEmail, IsISO8601, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsISO8601()
  @IsOptional()
  @Type(() => Date)
  birth_date?: Date;

  @IsBoolean()
  @IsOptional()
  gender?: boolean;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  gem?: number;

  @IsNumber()
  @IsOptional()
  exp?: number;

  @IsNumber()
  @IsOptional()
  weight_goal?: number;

  @IsString()
  @IsOptional()
  reminder_noti_time?: string;
}