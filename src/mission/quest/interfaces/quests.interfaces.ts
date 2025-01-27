import { QuestStatus } from '@/.typeorm/entities/user-quests.entity';

export interface QuestParams {
  query?: string;
  page?: number;
  limit?: number;
  categoryId?: number;
}

export interface UserQuestParams {
  page?: number;
  limit?: number;
  uid?: number;
  qid?: number;
  status?: QuestStatus;
  // query?: string;
  // categoryId?: number;
}

export enum QuestListFilter {
  ALL = 'all',
  DOING = 'doing',
  NOT_DOING = 'not-doing'
}