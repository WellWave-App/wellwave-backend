import { UserEntity } from '@/.typeorm/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import {
  NotificationSettingsEntity,
  NotificationType,
} from './noti-setting.entity';

@Entity('BEDTIME_SETTINGS')
export class BedtimeSettingsEntity {
  @PrimaryColumn({ name: 'UID', type: 'int' })
  UID: number;

  @PrimaryColumn({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column({ type: 'time', nullable: true })
  BEDTIME: Date;

  @Column({ type: 'time', nullable: true })
  WAKE_TIME: Date;

  @OneToOne(
    (type) => NotificationSettingsEntity,
    (notification) => notification.bedtimeSettings,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn([
    { name: 'UID', referencedColumnName: 'UID' },
    { name: 'NOTIFICATION_TYPE', referencedColumnName: 'NOTIFICATION_TYPE' },
  ])
  notificationSetting: NotificationSettingsEntity;
}
