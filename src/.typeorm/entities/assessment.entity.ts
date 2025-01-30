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
  @PrimaryGeneratedColumn({ name: 'RA_ID' })
  RA_ID: number;

  @Column({ name: 'DIASTOLIC_BLOOD_PRESSURE', type: 'float' })
  DIASTOLIC_BLOOD_PRESSURE: number;

  @Column({ name: 'SYSTOLIC_BLOOD_PRESSURE', type: 'float' })
  SYSTOLIC_BLOOD_PRESSURE: number;

  @Column({ name: 'HDL', type: 'float' })
  HDL: number;

  @Column({ name: 'LDL', type: 'float' })
  LDL: number;

  @Column({ name: 'WAIST_LINE', type: 'float' })
  WAIST_LINE: number;

  @Column({ name: 'HAS_SMOKE', type: 'boolean' })
  HAS_SMOKE: boolean;

  @Column({ name: 'HAS_DRINK', type: 'boolean' })
  HAS_DRINK: boolean;

  @Column({ name: 'HYPERTENSION', type: 'int4' })
  HYPERTENSION: number;

  @Column({ name: 'DIABETES', type: 'int4' })
  DIABETES: number;

  @Column({ name: 'DYSLIPIDEMIA', type: 'int4' })
  DYSLIPIDEMIA: number;

  @Column({ name: 'OBESITY', type: 'int4' })
  OBESITY: number;

  @CreateDateColumn({ name: 'createAt' })
  createAt: Date;

  @OneToOne(() => User, (USER) => USER.RiskAssessment)
  @JoinColumn({ name: 'UID' })
  USER: User;

  @Column({ name: 'UID' })
  UID: number;
}
