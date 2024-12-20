import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNumber, IsOptional, IsString, ValidateIf } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ required: false, description: 'Username' })
  @IsString()
  @IsOptional()
  USERNAME?: string;

  @ApiProperty({ required: true, description: 'Email address' })
  @IsEmail()
  EMAIL?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Password (required if GOOGLE_ID not provided)',
    minLength: 8
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.GOOGLE_ID)
  PASSWORD?: string;

  @ApiProperty({ 
    required: false, 
    description: 'Google ID (required if PASSWORD not provided)' 
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.PASSWORD)
  GOOGLE_ID?: string;

  @ApiProperty({ required: false, description: 'Year of birth' })
  @IsNumber()
  @IsOptional()
  YEAR_OF_BIRTH?: number;

  @ApiProperty({ required: false, description: 'Gender (true = male, false = female)' })
  @IsBoolean()
  @IsOptional()
  GENDER?: boolean;

  @ApiProperty({ required: false, description: 'Height' })
  @IsNumber()
  @IsOptional()
  HEIGHT?: number;

  @ApiProperty({ required: false, description: 'Weight' })
  @IsNumber()
  @IsOptional()
  WEIGHT?: number;

  @ApiProperty({ required: false, description: 'Gem count', default: 0 })
  @IsNumber()
  @IsOptional()
  GEM?: number;

  @ApiProperty({ required: false, description: 'Experience points', default: 0 })
  @IsNumber()
  @IsOptional()
  EXP?: number;

  @ApiProperty({ 
    required: false, 
    description: 'User goal (0: BUILD_MUSCLE, 1: LOSE_WEIGHT, 2: STAY_HEALTHY)' 
  })
  @IsNumber()
  @IsOptional()
  USER_GOAL?: number;

  @ApiProperty({ required: false, description: 'Profile image URL' })
  @IsString()
  @IsOptional()
  IMAGE_URL?: string;

  @ApiProperty({ required: false, description: 'Reminder notification time' })
  @IsString()
  @IsOptional()
  REMINDER_NOTI_TIME?: string;
}