import {
  IsString,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
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
  YEAR_OF_BIRTH?: number;

  @IsBoolean()
  GENDER?: boolean;

  @IsNumber()
  HEIGHT?: number;

  @IsNumber()
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
