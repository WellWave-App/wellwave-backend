import { LogEntity } from 'src/.typeorm/entities/logs.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  Unique,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity({ name: 'USERS' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  UID: number;

  @Column({ unique: true})
  USERNAME: string;

  @Column()
  PASSWORD: string;

  @Column({ unique: true})
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

  @Column({ type: 'date', default: new Date() })
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

  // // Method to check if entered password matches the stored hash
  // async validatePassword(password: string): Promise<boolean> {
  //   return bcrypt.compare(password, this.PASSWORD);
  // }
}
