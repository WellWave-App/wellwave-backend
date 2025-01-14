import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('RISK_ASSESSMENT')
export class RiskAssessmentEntity {
  @PrimaryGeneratedColumn()
  RA_ID: number;

  @Column('float')
  DIASTOLIC_BLOOD_PRESSURE: number;

  @Column('float')
  SYSTOLIC_BLOOD_PRESSURE: number;

  @Column('float')
  HDL: number;

  @Column('float')
  LDL: number;

  @Column('float')
  WAIST_LINE: number;

  @Column('boolean')
  HAS_SMOKE: boolean;

  @Column('boolean')
  HAS_DRINK: boolean;

  @Column('int4')
  HYPERTENSION: number;

  @Column('int4')
  DIABETES: number;

  @Column('int4')
  DYSLIPIDEMIA: number;

  @Column('int4')
  OBESITY: number;

  @CreateDateColumn()
  createAt: Date;

  @OneToOne(() => User, (USER) => USER.RiskAssessment)
  @JoinColumn({ name: 'UID' })
  USER: User;

  @Column({ name: 'UID' })
  UID: number;
}
