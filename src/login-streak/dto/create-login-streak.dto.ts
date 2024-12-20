import { IsDate, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateLoginStreakDto {
  @IsNotEmpty()
  UID: number;

  @IsOptional()
  @IsDate()
  STREAK_START_DATE: Date;

  @IsOptional()
  @IsDate()
  LAST_LOGIN_DATE: Date;

  @IsOptional()
  @IsNumber()
  CURRENT_STREAK: number;

  @IsOptional()
  @IsNumber()
  LONGEST_STREAK: number;
}
