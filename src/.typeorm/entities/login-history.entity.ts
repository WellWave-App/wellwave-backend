import {
  Entity,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
  Check,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './users.entity';

@Entity('LOGIN_HISTORY')
export class LoginHistoryEntity {
  @PrimaryGeneratedColumn()
  LH_ID: number;

  @Column()
  UID: number;

  @Column({ type: 'timestamp' })
  LOGIN_DATE: Date;

  @ManyToOne(() => User, (user) => user.UID, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'UID' })
  USER: User;
}
