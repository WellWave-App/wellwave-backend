import {
  IsString,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsOptional()
  USERNAME?: string;

  @IsEmail()
  EMAIL?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.GOOGLE_ID) // Only validate PASSWORD if GOOGLE_ID is not provided
  PASSWORD?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.PASSWORD) // Only validate GOOGLE_ID if PASSWORD is not provided
  GOOGLE_ID?: string;

  @IsNumber()
  @IsOptional()
  YEAR_OF_BIRTH?: number;

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
  USER_GOAL?: number;

  @IsString()
  @IsOptional()
  IMAGE_URL?: string;

  @IsString()
  @IsOptional()
  REMINDER_NOTI_TIME?: string;
}
