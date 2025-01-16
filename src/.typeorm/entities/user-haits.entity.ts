import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Habits } from './habit.entity';
import { User } from './users.entity';
import { Weekdays } from './noti-bedtime-setting.entity';
import { DailyHabitTrack } from './daily-habit-track.entity';

export enum HabitStatus {
  Active = 'active',
  Completed = 'completed',
  Failed = 'failed',
}

@Entity('USER_HABIT')
export class UserHabits {
  @PrimaryGeneratedColumn({ type: 'int', name: 'CHALLENGE_ID' })
  CHALLENGE_ID: number; // PK

  @Column({ name: 'UID', type: 'int' })
  UID: number; // [ref: > USERS.UID]

  @Column({ name: 'HID', type: 'int' })
  HID: number; // [ref: > HABITS.HID]

  @Column({ name: 'START_DATE', type: 'date', default: new Date() })
  START_DATE: Date;

  @Column({ name: 'END_DATE', type: 'date', nullable: true })
  END_DATE: Date;

  @Column({
    name: 'STATUS',
    type: 'enum',
    enum: HabitStatus,
    default: HabitStatus.Active,
  })
  STATUS: HabitStatus; // 'active', 'completed', 'failed'

  @Column({ name: 'DAILY_MINUTE_GOAL', type: 'int', nullable: true })
  DAILY_MINUTE_GOAL: number; // Minutes per day

  @Column({ name: 'DAYS_GOAL', type: 'int', nullable: true })
  DAYS_GOAL: number; // Total days goal

  @Column({ name: 'STREAK_COUNT', type: 'int', nullable: true })
  STREAK_COUNT: number; // Current streak

  @Column({ name: 'IS_NOTIFICATION_ENABLED', type: 'bool', default: false })
  IS_NOTIFICATION_ENABLED: boolean;

  @Column({
    name: 'WEEKDAYS_NOTI',
    type: 'jsonb',
    default: {
      Sunday: false,
      Monday: false,
      Tuesday: false,
      Wednesday: false,
      Thursday: false,
      Friday: false,
      Saturday: false,
    },
  })
  WEEKDAYS_NOTI: Weekdays;

  // relations
  @ManyToOne(() => Habits, { eager: true })
  @JoinColumn({ name: 'HID' }) // Relation with QUEST
  Habits: Habits;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'UID' }) // Relation with USERS
  USER: User;

  @OneToMany(
    () => DailyHabitTrack,
    (DailyHabitTrack) => DailyHabitTrack.UserHabits,
    { eager: true, onDelete: 'CASCADE' },
  )
  DailyTrack: DailyHabitTrack[];
}
