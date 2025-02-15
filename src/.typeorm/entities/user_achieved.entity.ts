import { Entity, PrimaryColumn, Column, ManyToOne, OneToOne } from 'typeorm';
import { User } from './users.entity';
import { Achievement } from './achievement.entity';

@Entity('USER_ACHIEVED')
export class UserAchieved {
  @PrimaryColumn('int', { name: 'UID' })
  UID: number;

  @PrimaryColumn('uuid', { name: 'ACH_ID' })
  ACH_ID: string;

  @PrimaryColumn('int', { name: 'LEVEL' })
  LEVEL: number;

  @Column('date', { name: 'ACHIEVED_DATE' })
  ACHIEVED_DATE: Date;

  @Column('boolean', { name: 'IS_READ', default: false })
  IS_READ?: boolean;

  @ManyToOne(() => User, (user) => user.UserAchieveds, { eager: true })
  user: User;

  @ManyToOne(() => Achievement, { eager: true })
  achievment: Achievement;
}
