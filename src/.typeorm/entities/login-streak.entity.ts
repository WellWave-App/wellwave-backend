// login-streak.entity.ts
import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  Check,
} from 'typeorm';
import { UserEntity } from './users.entity';

@Entity('login_streak')
// @Check(`"last_login_date" >= "streak_start_date"`)
export class LoginStreakEntity {
  @PrimaryColumn()
  UID: number;

  @Column({ type: 'timestamp' })
  STREAK_START_DATE: Date;

  @Column({ type: 'timestamp' })
  LAST_LOGIN_DATE: Date;

  @Column({ type: 'int', default: 1 })
  CURRENT_STREAK: number;

  @Column({ type: 'int', default: 1 })
  LONGEST_STREAK: number;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  LAST_UPDATED: Date;

  @OneToOne(() => UserEntity, (user) => user.UID, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'UID' })
  USER: UserEntity;
}
