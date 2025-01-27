import {
  Column,
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Quest } from './quest.entity';
import { User } from './users.entity';
import { DailyHabitTrack } from './daily-habit-track.entity';

export enum QuestStatus {
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity('USER_QUESTS')
export class UserQuests {
  @PrimaryColumn({ type: 'int', name: 'QID' })
  QID: number; // PK [ref: > QUEST.QID]

  @PrimaryColumn({ type: 'int', name: 'UID' })
  UID: number; // PK [ref: > USERS.UID]

  @Column({ type: 'date', name: 'START_DATE', default: new Date() })
  START_DATE: Date;

  @Column({ type: 'date', name: 'END_DATE', nullable: true })
  END_DATE: Date;

  @Column({
    type: 'enum',
    enum: QuestStatus,
    name: 'STATUS',
    default: QuestStatus.Active,
  })
  STATUS: QuestStatus; // 'active', 'completed', 'failed'

  @Column({ type: 'float', name: 'CURRENT_MINUTES', default: 0 })
  CURRENT_MINUTES: number; // Accumulated minutes for time-based quests

  @Column({ type: 'int', name: 'CURRENT_DAYS', default: 0 })
  CURRENT_DAYS: number; // Accumulated days for streak-based quests

  @Column({ type: 'int', name: 'CURRENT_COUNT', default: 0 })
  CURRENT_COUNT: number; // Accumulated count for count-based quests

  @Column({ type: 'float', name: 'PROGRESS_PERCENTAGE', default: 0 })
  PROGRESS_PERCENTAGE: number; // Progress percentage

  // relations
  @ManyToOne(() => Quest, { eager: true })
  @JoinColumn({ name: 'QID' }) // Relation with QUEST
  quest: Quest;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'UID' }) // Relation with USERS
  user: User;
}
