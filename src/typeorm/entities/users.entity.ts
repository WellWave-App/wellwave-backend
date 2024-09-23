import { LogEntity } from 'src/typeorm/entities/logs.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';

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

  @Column()
  YEAR_OF_BIRTH: number;

  @Column()
  GENDER: boolean;

  @Column()
  HEIGHT: number;

  @Column()
  WEIGHT: number;

  @Column({ default: 0 })
  GEM: number;

  @Column({ default: 0 })
  EXP: number;

  @Column({ nullable: true })
  USER_GOAL: number;

  @Column({ nullable: true })
  REMINDER_NOTI_TIME?: string;

  @Column({ default: new Date() })
  createAt: Date;

  @OneToMany(() => LogEntity, (LOGS) => LOGS.USER)
  LOGS: LogEntity[];
}
