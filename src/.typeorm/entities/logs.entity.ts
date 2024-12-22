import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';
import { ApiProperty } from '@nestjs/swagger';

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
  @ApiProperty({
    description: 'User ID',
    example: 1
  })
  @PrimaryColumn()
  UID: number;

  @ApiProperty({
    description: 'Type of log entry',
    enum: LOG_NAME,
    example: LOG_NAME.WEIGHT_LOG
  })
  @PrimaryColumn({
    type: 'enum',
    enum: LOG_NAME,
  })
  LOG_NAME: LOG_NAME;

  @ApiProperty({
    description: 'Date of the log entry',
    example: '2024-12-22'
  })
  @PrimaryColumn({ type: 'date' })
  DATE: Date;

  @ApiProperty({
    description: 'Numerical value for the log entry',
    example: 75.5
  })
  @Column({ type: 'float' })
  VALUE: number;

  @ApiProperty({
    description: 'Associated user entity',
    type: () => UserEntity
  })
  @ManyToOne(() => UserEntity, (USER) => USER.LOGS, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UID' })
  USER: UserEntity;
}