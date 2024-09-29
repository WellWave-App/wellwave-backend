import { IsString, IsEmail, IsISO8601, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  USERNAME: string;

  @IsEmail()
  EMAIL: string;

  @IsNumber()
  YEAR_OF_BIRTH: number;

  @IsBoolean()
  GENDER: boolean;

  @IsNumber()
  HEIGHT: number;

  @IsNumber()
  WEIGHT: number;

  @IsNumber()
  @IsOptional()
  GEM?: number;

  @IsNumber()
  @IsOptional()
  EXP?: number;

  @IsNumber()
  @IsOptional()
  USER_GOAL?: number;

  @IsString()
  @IsOptional()
  IMAGE_URL?: string;
  
  @IsString()
  @IsOptional()
  REMINDER_NOTI_TIME?: string;

  // @IsISO8601()
  // // @IsOptional()
  // @Type(() => Date)
  // createAt?: Date
}