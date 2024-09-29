import { IsString, IsEmail, IsStrongPassword } from 'class-validator';
import { Type } from 'class-transformer';

export class RegisterUserDto {
  @IsEmail()
  EMAIL: string;

  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0
  })
  PASSWORD: string;
}

/* 
@IsStrongPassword()
Minimum length (usually 8 characters)
At least one uppercase letter
At least one lowercase letter
At least one number
*/