import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { LeagueType } from '../enum/lagues.enum';

export class CreateUserLeagderboardDto {
  @IsNotEmpty()
  @IsNumber()
  UID: number;

  @IsOptional()
  @IsEnum(LeagueType)
  CURRENT_LEAGUE?: LeagueType;

  @IsOptional()
  @IsNumber()
  CURRENT_RANK?: number;

  @IsOptional()
  @IsNumber()
  CURRENT_EXP?: number; // reset every date 1, 16

  @IsOptional()
  @IsEnum(LeagueType)
  PREVIOUS_LEAGUE?: LeagueType;

  @IsOptional()
  @IsNumber()
  PREVIOUS_RANK?: number;

  @IsOptional()
  @IsNumber()
  GROUP_NUMBER?: number;
}
