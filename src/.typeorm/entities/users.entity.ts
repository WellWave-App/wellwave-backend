import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
  Unique,
  OneToOne,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RiskAssessmentEntity } from './assessment.entity';
import { LogEntity } from './logs.entity';

export enum USER_GOAL {
  BUILD_MUSCLE = 0,
  LOSE_WEIGHT = 1,
  STAY_HEALTHY = 2,
}

// GENDER: true = MALE, false = FEMALE

@Entity({ name: 'USERS' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  UID: number;

  @Column({ unique: true, nullable: true })
  USERNAME: string;

  @Column({ nullable: true }) // Make PASSWORD optional
  PASSWORD?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.PASSWORD) {
      this.PASSWORD = await bcrypt.hash(this.PASSWORD, 10);
    }
  }

  @Column({ unique: true })
  EMAIL: string;

  @Column({ unique: true, nullable: true }) // Add GOOGLE_ID field
  GOOGLE_ID?: string;

  @Column({ type: 'int', nullable: true })
  YEAR_OF_BIRTH: number;

  @Column({ type: 'boolean', nullable: true })
  GENDER: boolean;

  @Column({ type: 'int', nullable: true })
  HEIGHT: number;

  @Column({ type: 'int', nullable: true })
  WEIGHT: number;

  @Column({ default: 0 })
  GEM: number;

  @Column({ default: 0 })
  EXP: number;

  @Column({ type: 'enum', enum: USER_GOAL, nullable: true })
  USER_GOAL: USER_GOAL;

  @Column({ nullable: true })
  REMINDER_NOTI_TIME?: string;

  @Column({ nullable: true })
  IMAGE_URL?: string;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @OneToMany(() => LogEntity, (LOGS) => LOGS.USER, { cascade: true })
  LOGS: LogEntity[];

  @OneToOne(() => RiskAssessmentEntity, (RiskAssessment) => RiskAssessment.USER)
  RiskAssessment: RiskAssessmentEntity[];  
}
