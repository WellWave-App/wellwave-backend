import {
  IsString,
  IsEmail,
  IsStrongPassword,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class RegisterUserDto {
  @IsEmail()
  EMAIL: string;

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

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.PASSWORD) // Only validate GOOGLE_ID if PASSWORD is not provided
  GOOGLE_ID?: string;
}
