import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserHabits } from './user-habits.entity';

export enum DailyStatus {
  COMPLETE = 'complete',
  ACTIVE = 'acive',
  FAILED = 'failed',
}

export enum Moods {
  HOPELESS = 'ท้อแท้',
  STRESSED = 'กดดัน',
  NEUTRAL = 'เฉยๆ',
  SATISFIED = 'พอใจ',
  CHEERFUL = 'สดใส',
}

@Entity('DAILY_HABIT_TRACK')
export class DailyHabitTrack {
  @PrimaryGeneratedColumn({ name: 'TRACK_ID', type: 'int' })
  TRACK_ID: number;

  @Column({ name: 'CHALLENGE_ID', type: 'int' })
  CHALLENGE_ID: number; // PK [ref: > USER_HABITS_CHALLENGE.CHALLENGE_ID]

  @Column({ name: 'TRACK_DATE', type: 'date', default: new Date() })
  TRACK_DATE: Date; // PK

  // @Column({
  //   name: 'STATUS',
  //   type: 'enum',
  //   enum: DailyStatus,
  //   default: DailyStatus.ACTIVE,
  // })
  // STATUS: DailyStatus;

  @Column({ name: 'COMPLETED', type: 'boolean', default: false })
  COMPLETED: boolean;
  
  @Column({ name: 'DURATION_MINUTES', type: 'float', nullable: true })
  DURATION_MINUTES: number;

  @Column({ name: 'DISTANCE_KM', type: 'float', nullable: true })
  DISTANCE_KM: number;

  @Column({ name: 'COUNT_VALUE', type: 'int', nullable: true })
  COUNT_VALUE: number;

  // @Column({ nullable: true, name: 'MINUTES_SPENT', type: 'float' })
  // MINUTES_SPENT: number; // Actual time spent (in case of exercise habit type)

  @Column({
    type: 'enum',
    enum: Moods,
    nullable: true,
  })
  MOOD_FEEDBACK: string; // Mood options

  @ManyToOne(() => UserHabits, (userHabits) => userHabits.dailyTracks)
  @JoinColumn({ name: 'CHALLENGE_ID' })
  UserHabits: UserHabits;
}
