import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
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
  WAIST_LINE_LOG = 'WAIST_LINE_LOG'
}

@Entity('LOGS')
export class LogEntity {
  @PrimaryColumn()
  UID: number;

  @PrimaryColumn({
    type: 'enum',
    enum: LOG_NAME,
  })
  LOG_NAME: LOG_NAME;

  @PrimaryColumn({ type: 'date' })
  DATE: Date;

  @Column({ type: 'float' })
  VALUE: number;

  @ManyToOne(() => UserEntity, (USER) => USER.LOGS, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UID' })
  USER: UserEntity;
}