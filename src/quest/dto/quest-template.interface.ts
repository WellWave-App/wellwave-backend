import { QUEST_TYPE } from '../../.typeorm/entities/quest.entity';

export interface QuestTemplate {
  QUEST_TYPE: QUEST_TYPE;
  QUEST_TITLE: string;
  DESCRIPTION: string;
  QUEST_DAY_DURATION: number;
  EXP_REWARDS: number;
  GEM_REWARDS: number;
  DIFFICULTY: 'EASY' | 'MEDIUM' | 'HARD';
  requirements: {
    targetValue: number;
    additionalParams?: Record<string, any>;
  };
}
