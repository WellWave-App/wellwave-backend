import { IsString, IsEmail, IsISO8601, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  email: string;

  @IsISO8601()
  @Type(() => Date)
  birth_date: Date;

  @IsBoolean()
  gender: boolean;

  @IsNumber()
  height: number;

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