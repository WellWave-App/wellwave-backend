// logs/entities/log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from './users.entity';

export enum LOG_NAME {
  HDL_LOG = 'HDL_LOG',
  LDL_LOG = 'LDL_LOG',
  WEIGHT_LOG = 'WEIGHT_LOG',
  SLEEP_LOG = 'SLEEP_LOG',
  HEART_RATE_LOG = 'HEART_RATE_LOG',
  CAL_BURN_LOG = 'CAL_BURN_LOG',
  DRINK_LOG = 'DRINK_LOG',
  STEP_LOG = 'STEP_LOG',
}

@Entity('LOGS')
// @Unique(['UID', 'DATE', 'LOG_NAME'])
export class LogEntity {
  @PrimaryGeneratedColumn()
  LID: number;

  @Column({ type: 'date', default: new Date() })
  DATE: Date;

  @Column('float')
  VALUE: number;

  @Column({
    type: 'enum',
    enum: LOG_NAME,
  })
  LOG_NAME: LOG_NAME;

  @ManyToOne(() => UserEntity, (USER) => USER.LOGS)
  @JoinColumn({ name: 'UID' })
  USER: UserEntity;

  @Column({ name: 'UID' })
  UID: number;
}
