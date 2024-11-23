import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { QUEST_TYPE } from '../../.typeorm/entities/quest.entity';

export class CreateQuestDto {
  @IsUrl()
  @IsOptional()
  QUEST_IMG?: string;

  @IsString()
  @MaxLength(100)
  QUEST_TITLE: string;

  @IsEnum(QUEST_TYPE)
  QUEST_TYPE: QUEST_TYPE;

  @IsNumber()
  @Min(1)
  QUEST_DAY_DURATION: number;

  @IsString()
  @MaxLength(500)
  DESCRIPTION: string;

  @IsNumber()
  @Min(0)
  EXP_REWARDS: number;

  @IsNumber()
  @Min(0)
  GEM_REWARDS: number;

  @IsOptional()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: 'Time must be in format HH:MM:SS',
  })
  RQ_ACTIVITY_TARGET_TIME?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  RQ_TARGET_DISTANCE?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  RQ_SUCCESS_HABIT?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  RQ_READ_AMOUT?: number;
}

export class JoinQuestDto {
  UID: number;
  QID: number;
}

export enum QuestFilterType {
  ALL = 'all',
  DOING = 'doing',
}
