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
import { LoginStreakEntity } from './login-streak.entity';
import { UserReadHistory } from './user-read-history.entity';
import { ApiProperty } from '@nestjs/swagger';
import { UserHabits } from './user-habits.entity';
import { UserQuests } from './user-quests.entity';

export enum USER_GOAL {
  BUILD_MUSCLE = 0,
  LOSE_WEIGHT = 1,
  STAY_HEALTHY = 2,
}

// GENDER: true = MALE, false = FEMALE
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity({ name: 'USERS' })
export class User {
  @PrimaryGeneratedColumn()
  UID: number;

  @Column({ unique: true, nullable: true, name: 'USERNAME' })
  USERNAME: string;

  @Column({ nullable: true, name: 'PASSWORD' }) // Make PASSWORD optional
  PASSWORD?: string;

  private tempPassword?: string;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // Only hash if the password was actually changed
    if (this.tempPassword) {
      this.PASSWORD = await bcrypt.hash(this.tempPassword, 10);
      this.tempPassword = undefined;
    }
  }

  // Add a method to safely update password
  setPassword(password: string | undefined) {
    if (password) {
      this.tempPassword = password;
    }
  }

  @Column({ unique: true, name: 'EMAIL' })
  EMAIL: string;

  @Column({ unique: true, nullable: true, name: 'GOOGLE_ID' }) // Add GOOGLE_ID field
  GOOGLE_ID?: string;

  @Column({ type: 'int', nullable: true, name: 'YEAR_OF_BIRTH' })
  YEAR_OF_BIRTH: number;

  @Column({ type: 'boolean', nullable: true, name: 'GENDER' })
  GENDER: boolean;

  @Column({ type: 'int', nullable: true, name: 'HEIGHT' })
  HEIGHT: number;

  @Column({ type: 'int', nullable: true, name: 'WEIGHT' })
  WEIGHT: number;

  @Column({ default: 0, name: 'GEM' })
  GEM: number;

  @Column({ default: 0, name: 'EXP' })
  EXP: number;

  @Column({ nullable: true, name: 'REMINDER_NOTI_TIME' })
  REMINDER_NOTI_TIME?: string;

  @Column({ nullable: true, name: 'IMAGE_URL' })
  IMAGE_URL?: string;

  @Column({ type: 'enum', enum: USER_GOAL, nullable: true, name: 'USER_GOAL' })
  USER_GOAL: USER_GOAL;

  @Column({ nullable: true, type: 'int', name: 'USER_GOAL_STEP_WEEK' })
  USER_GOAL_STEP_WEEK: number;

  @Column({ nullable: true, type: 'int', name: 'USER_GOAL_EX_TIME_WEEK' })
  USER_GOAL_EX_TIME_WEEK: number;

  @Column({
    type: 'date',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'createAt',
  })
  createAt: Date;

  @OneToMany(() => LogEntity, (LOGS) => LOGS.USER, { cascade: true })
  LOGS: LogEntity[];

  @OneToOne(
    () => RiskAssessmentEntity,
    (RiskAssessment) => RiskAssessment.USER,
    { cascade: true },
  )
  RiskAssessment: RiskAssessmentEntity;

  @ApiProperty({ type: () => [UserReadHistory] })
  @OneToMany(() => UserReadHistory, (userRead) => userRead.user, {
    cascade: true,
  })
  articleReadHistory: UserReadHistory[];

  @OneToMany(() => UserHabits, (habit) => habit.user)
  habits: UserHabits[];

  @OneToOne(() => LoginStreakEntity, (LoginStreak) => LoginStreak.USER)
  loginStreak: LoginStreakEntity;

  @OneToMany(() => UserQuests, (quest) => quest.user)
  quests: UserQuests[];
}
