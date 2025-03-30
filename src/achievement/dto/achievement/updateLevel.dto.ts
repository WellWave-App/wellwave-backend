import { LeagueType } from '@/leagues/enum/lagues.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsNumber,
  Min,
  IsEnum,
  IsObject,
  ValidateNested,
} from 'class-validator';

export class UpdateAchievementLevelDto {
  @ApiPropertyOptional({
    description: 'URL for the achievement level icon',
    example: 'https://example.com/icons/gold-medal.png',
  })
  @IsOptional()
  @IsString()
  ICON_URL?: string;

  @ApiPropertyOptional({
    description: 'Target value required to achieve this level',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  TARGET_VALUE?: number;

  @ApiPropertyOptional({
    description: 'Target league for this achievement level',
    enum: LeagueType,
    example: LeagueType.DIAMOND,
  })
  @IsOptional()
  @IsEnum(LeagueType)
  TARGET_LEAGUE?: LeagueType;

  @ApiPropertyOptional({
    description: 'Rewards for completing this achievement level',
    example: { EXP: 100, GEMS: 50 },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  REWARDS?: {
    EXP?: number;
    GEMS?: number;
  };
}
