import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from './users.entity';


@Entity('RISK_ASSESSMENT') 
export class RiskAssessmentEntity { 
  
  @PrimaryGeneratedColumn()
  RA_ID: number;

  @Column('float')
  HEIGHT: number;

  @Column('float')
  WEIGHT: number;

  @Column('float')
  HDL: number;

  @Column('float')
  LDL: number;

  @Column('float')
  WAIST_LINE: number;

  @Column('float')
  BLOOD_PRESSURE: number;

  @Column('float')
  BLOOD_GLUCOSE: number;

  @Column('boolean')
  HAS_HYPERTENSION: boolean;

  @Column('boolean')
  HAS_DIABETES: boolean;

  @Column('boolean')
  HAS_DYSLIPIDEMIA: boolean;

  @Column('boolean')
  HAS_OBESITY: boolean;

  @OneToOne(() => UserEntity, (USER) => USER.RiskAssessment)
  @JoinColumn({ name: 'UID' })
  USER: UserEntity;

  @Column({ name: 'UID' })
  UID: number;

}


  