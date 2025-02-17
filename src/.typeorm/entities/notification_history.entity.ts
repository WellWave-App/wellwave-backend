import { User } from '@/.typeorm/entities/users.entity';
import { Achievement } from './achievement.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum APP_ROUTE {
  Achievement = 'achievement',
  Friend = 'friend',
  Leaderboard = 'leaderboard',
}

@Entity('NOTIFICATION_HISTORYS')
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid', { name: 'NOTIFICATION_ID' })
  NOTIFICATION_ID: string;

  @Column('varchar', { name: 'IMAGE_URL', nullable: true })
  IMAGE_URL?: string;

  @Column('text', { name: 'MESSAGE' })
  MESSAGE: string;

  @Column('boolean', { name: 'IS_READ', default: false })
  IS_READ?: boolean;

  @Column('varchar', { name: 'FROM', nullable: true })
  FROM?: string;

  @Column('varchar', { name: 'TO', nullable: true })
  TO?: string;

  @Column('enum', { name: 'APP_ROUTE', nullable: true, enum: APP_ROUTE })
  APP_ROUTE?: APP_ROUTE;

  @CreateDateColumn({ type: 'date', name: 'createAt' })
  createAt: Date;

  @ManyToOne(() => User, (u) => u.notfications)
  @JoinColumn({ name: 'UID' })
  user: User;
}
