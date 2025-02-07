// login-streak.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  Check,
} from 'typeorm';
import { User } from './users.entity';

@Entity('LOGIN_STREAK')
// @Check(`"last_login_date" >= "streak_start_date"`)
export class LoginStreakEntity {
  @PrimaryColumn()
  UID: number;

  @Column({ name: 'STREAK_START_DATE', type: 'timestamp' })
  STREAK_START_DATE: Date;

  @Column({ name: 'LAST_LOGIN_DATE', type: 'timestamp' })
  LAST_LOGIN_DATE: Date;

  @Column({ name: 'CURRENT_STREAK', type: 'int', default: 1 })
  CURRENT_STREAK: number;

  @Column({ name: 'LONGEST_STREAK', type: 'int', default: 1 })
  LONGEST_STREAK: number;

  @Column({
    name: 'LAST_UPDATED',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  LAST_UPDATED: Date;

  @OneToOne(() => User, (user) => user.UID, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'UID' })
  USER: User;
}
