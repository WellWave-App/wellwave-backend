import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  EMAIL: string;

  @IsNotEmpty()
  @IsString()
  PASSWORD: string;
}

/* 
@IsStrongPassword()
Minimum length (usually 8 characters)
At least one uppercase letter
At least one lowercase letter
At least one number
*/
