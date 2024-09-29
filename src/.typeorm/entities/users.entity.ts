import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  OneToOne,
} from 'typeorm';
import { RiskAssessmentEntity } from './assessment.entity';
import { LogEntity } from './logs.entity';

@Entity({ name: 'USERS' })
// @Unique(["UID"])
export class UserEntity {
  @PrimaryGeneratedColumn()
  UID: number;

  @Column()
  USERNAME: string;

  // @Column()
  // PASSWORD: string;

  @Column()
  EMAIL: string;

  @Column({ type: 'int' })
  YEAR_OF_BIRTH: number;

  @Column({ type: 'boolean' })
  GENDER: boolean;

  @Column({ type: 'int' })
  HEIGHT: number;

  @Column({ type: 'int' })
  WEIGHT: number;

  @Column({ default: 0 })
  GEM: number;

  @Column({ default: 0 })
  EXP: number;

  @Column({ type: 'int', nullable: true })
  USER_GOAL: number;

  @Column({ nullable: true })
  REMINDER_NOTI_TIME?: string;

  @Column({ nullable: true })
  IMAGE_URL?: string;

  @Column({ type: 'date', default: new Date() })
  createAt: Date;

  @OneToMany(() => LogEntity, (LOGS) => LOGS.USER)
  LOGS: LogEntity[];

  @OneToOne(() => RiskAssessmentEntity, (RiskAssessment) => RiskAssessment.USER)
  RiskAssessment: RiskAssessmentEntity[];

  
}
