import { MOOD_FEEDBACK } from '../../.typeorm/entities/habit.entity';

export class StartHabitDto {
  UID: number;
  HID: number;
  USER_TIME_GOAL: number;
  USER_DAYS_GOAL: number;
  REMINDER_NOTI_TIME?: Date;
}

export class CompleteHabitDto {
  UID: number;
  HID: number;
  TIME_USED?: number;
  MOOD_FEEDBACK?: MOOD_FEEDBACK;
}

export enum HabitFilterType {
  ALL = 'all',
  DOING = 'doing',
}
