import { Role } from '@/auth/roles/roles.enum';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsStrongPassword,
  IsOptional,
  ValidateIf,
  IsEnum,
} from 'class-validator';

export class RegisterUserDto {
  @ApiProperty({ required: true, description: 'Email address' })
  @IsEmail()
  EMAIL: string;

  @ApiProperty({
    required: false,
    description: 'Password (required if GOOGLE_ID not provided)',
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 0,
  })
  @ValidateIf((o) => !o.GOOGLE_ID) // Only validate PASSWORD if GOOGLE_ID is not provided
  PASSWORD?: string;

  @ApiProperty({
    required: false,
    description: 'Google ID (required if PASSWORD not provided)',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.PASSWORD) // Only validate GOOGLE_ID if PASSWORD is not provided
  GOOGLE_ID?: string;

  @IsOptional()
  @IsEnum(Role)
  ROLE?: Role;
}
