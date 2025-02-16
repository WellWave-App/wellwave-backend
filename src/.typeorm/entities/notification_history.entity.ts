import { User } from '@/.typeorm/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

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

  @CreateDateColumn({ type: 'date', name: 'createAt' })
  createAt: Date;

  @ManyToOne(() => User, (u) => u.notfications)
  @JoinColumn({ name: 'UID' })
  user: User;
}
