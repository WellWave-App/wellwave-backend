import { IsString, IsEmail, IsISO8601, IsBoolean, IsNumber, IsOptional, IsStrongPassword } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterDto {
  @IsEmail()
  EMAIL: string;

  @IsString()
  @IsStrongPassword()
  PASSWORD: string;
}