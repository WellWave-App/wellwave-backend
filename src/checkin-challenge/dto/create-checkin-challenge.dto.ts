import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCheckinChallengeDto {
  @IsNotEmpty()
  UID: number;

  @IsOptional()
  STREAK_START_DATE: Date;

  @IsOptional()
  LAST_LOGIN_DATE: Date;

  @IsOptional()
  CURRENT_STREAK: number;

  @IsOptional()
  LONGEST_STREAK: number;

  @IsOptional()
  TOTAL_POINTS_EARNED: number;
}
