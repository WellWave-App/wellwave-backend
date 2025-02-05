import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './users.entity';

enum Point {
  DAY1 = 10,
  DAY2 = 10,
  DAY3 = 10,
  DAY4 = 10,
  DAY5 = 10,
  DAY6 = 10,
  DAY7 = 20,
}

@Entity('CHECK_IN')
export class CheckInChallenge {
  @PrimaryColumn({ name: 'ID', type: 'uuid' })
  ID: string;

  @Column({ name: 'STREAK_START_DATE', type: 'timestamp' })
  STREAK_START_DATE: Date;

  @Column({ name: 'LAST_LOGIN_DATE', type: 'timestamp' })
  LAST_LOGIN_DATE: Date;

  @Column({ name: 'CURRENT_STREAK', type: 'int', default: 1 })
  CURRENT_STREAK: number;

  @Column({ name: 'LONGEST_STREAK', type: 'int', default: 1 })
  LONGEST_STREAK: number;

  @Column({ name: 'TOTAL_POINTS_EARNED', type: 'int', default: 0 })
  TOTAL_POINTS_EARNED: number;

  @Column({
    name: 'LAST_UPDATED',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  LAST_UPDATED: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'UID' })
  user: User;
}
