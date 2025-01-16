import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserHabits } from './user-haits.entity';

export enum DailyStatus {
  COMPLETE = 'complete',
  ACTIVE = 'acive',
  FAILED = 'failed',
}

@Entity('DAILY_HABIT_TRACK')
export class DailyHabitTrack {
  @PrimaryColumn({ name: 'CHALLENGE_ID', type: 'int' })
  CHALLENGE_ID: number; // PK [ref: > USER_HABITS_CHALLENGE.CHALLENGE_ID]

  @PrimaryColumn({ name: 'TRACK_DATE', type: 'date', default: new Date() })
  TRACK_DATE: Date; // PK

  @Column({
    name: 'STATUS',
    type: 'enum',
    enum: DailyStatus,
    default: DailyStatus.ACTIVE,
  })
  STATUS: boolean; // Completed or not

  @Column({ nullable: true, name: 'MINUTES_SPENT', type: 'float' })
  MINUTES_SPENT: number; // Actual time spent (in case of exercise habit type)

  @Column({
    type: 'enum',
    enum: ['ท้อแท้', 'กดดัน', 'เฉยๆ', 'พอใจ', 'สดใส'],
    nullable: true,
  })
  MOOD_FEEDBACK: string; // Mood options

  @ManyToOne(() => UserHabits, (userHabits) => userHabits.DailyTrack)
  @JoinColumn({ name: 'CHALLENGE_ID' })
  UserHabits: UserHabits;
}
