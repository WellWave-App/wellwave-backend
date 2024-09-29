import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './users.entity';

@Entity('health_assessment') 
export class HealthAssessment { 
  @PrimaryGeneratedColumn()
  id: number;

  @Column('float')
  height: number;

  @Column('float')
  weight: number;

  @Column('float')
  ldl: number;

  @Column('float')
  hdl: number;

  @Column('float')
  fat: number;

  @Column('float')
  blood_pressure: number;

  @Column('float')
  blood_glucose: number;

  @Column('boolean')
  has_hypertension: boolean;

  @Column('boolean')
  has_diabetes: boolean;

  @Column('boolean')
  has_dyslipidemia: boolean;

  @Column('boolean')
  has_obesity: boolean;
  @ManyToOne(() => User, (user) => user.healthAssessments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ name: 'userId' })
  userId: number;
}
