// logs/entities/log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum LogType {
  HDL_LOG = 'HDL_LOG',
  LDL_LOG = 'LDL_LOG',
  WEIGHT_LOG = 'WEIGHT_LOG',
  SLEEP_LOG = 'SLEEP_LOG',
  HEART_RATE_LOG = 'HEART_RATE_LOG',
  CAL_BURN_LOG = 'CAL_BURN_LOG',
  DRINK_LOG = 'DRINK_LOG',
  STEP_LOG = 'STEP_LOG',
}

@Entity('logs')
export class LogEntity {
  @PrimaryGeneratedColumn()
  lid: number;

  @CreateDateColumn({ default: new Date()})
  date: Date;

  @Column('float')
  value: number;

  @Column({
    type: 'enum',
    enum: LogType,
  })
  type: LogType;

  @ManyToOne(() => User, (user) => user.logs)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;
}
