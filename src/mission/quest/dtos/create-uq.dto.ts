import { QuestStatus } from '@/.typeorm/entities/user-quests.entity';
import { PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserQuestDto {
  @IsNotEmpty()
  @IsNumber()
  QID: number;

  @IsNotEmpty()
  @IsNumber()
  UID: number;

  @IsOptional()
  START_DATE: Date;

  @IsOptional()
  END_DATE: Date;

  @IsOptional()
  STATUS: QuestStatus; // 'active', 'completed', 'failed'

  @IsOptional()
  CURRENT_MINUTES: number; // Accumulated minutes for time-based quests

  @IsOptional()
  CURRENT_DAYS: number; // Accumulated days for streak-based quests

  @IsOptional()
  CURRENT_COUNT: number; // Accumulated count for count-based quests

  @IsOptional()
  PROGRESS_PERCENTAGE: number; // Progress percentage
}

export class JoinQuestDto extends PartialType(CreateUserQuestDto) {
  @IsNotEmpty()
  @IsNumber()
  QID: number;

  @IsNotEmpty()
  @IsNumber()
  UID: number;
}
