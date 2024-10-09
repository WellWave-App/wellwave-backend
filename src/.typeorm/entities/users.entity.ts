import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
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

  @Column()
  PASSWORD: string;

  @Column({ unique: true })
  EMAIL: string;

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

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.PASSWORD) {
      // const salt = await bcrypt.genSalt();
      this.PASSWORD = await bcrypt.hash(this.PASSWORD, 10);
    }
  }
}
