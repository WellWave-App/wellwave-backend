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

  @Column({ type: 'int', nullable: true })
  USER_GOAL: number;

  @Column({ nullable: true })
  REMINDER_NOTI_TIME?: string;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;

  @OneToMany(() => LogEntity, (LOGS) => LOGS.USER)
  LOGS: LogEntity[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.PASSWORD) {
      const salt = await bcrypt.genSalt();
      this.PASSWORD = await bcrypt.hash(this.PASSWORD, salt);
    }
  }
}