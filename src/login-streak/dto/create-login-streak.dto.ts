import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

// DTO decorators
export class CreateLoginStreakDto {
  @ApiProperty({ description: 'User ID', example: 1 })
  @IsNotEmpty()
  UID: number;

  @ApiProperty({ description: 'Date when streak started', required: false })
  @IsOptional()
  @IsDate()
  STREAK_START_DATE: Date;

  @ApiProperty({ description: 'Date of last login', required: false })
  @IsOptional()
  @IsDate()
  LAST_LOGIN_DATE: Date;

  @ApiProperty({ description: 'Current login streak count', required: false, minimum: 1 })
  @IsOptional()
  @IsNumber()
  CURRENT_STREAK: number;

  @ApiProperty({ description: 'Longest achieved streak', required: false, minimum: 1 })
  @IsOptional()
  @IsNumber()
  LONGEST_STREAK: number;
}