import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { User } from './users.entity';

export enum CheckinRewards {
  DAY1 = 5,
  DAY2 = 5,
  DAY3 = 10,
  DAY4 = 10,
  DAY5 = 15,
  DAY6 = 15,
  DAY7 = 30,
}

@Entity('LOGIN_CHALLENGE')
export class CheckInChallenge {
  @PrimaryColumn({ name: 'UID', type: 'int', default: 1 })
  UID: number;
  @OneToOne(() => User)
  @JoinColumn({ name: 'UID' })
  user: User;

  @Column({ name: 'STREAK_START_DATE', type: 'date' })
  STREAK_START_DATE: Date;

  @Column({ name: 'LAST_LOGIN_DATE', type: 'date' })
  LAST_LOGIN_DATE: Date;

  @Column({ name: 'CURRENT_STREAK', type: 'int', default: 1 })
  CURRENT_STREAK: number;

  @Column({ name: 'LONGEST_STREAK', type: 'int', default: 1 })
  LONGEST_STREAK: number;

  @Column({ name: 'TOTAL_POINTS_EARNED', type: 'int', default: 0 })
  TOTAL_POINTS_EARNED: number;
}
