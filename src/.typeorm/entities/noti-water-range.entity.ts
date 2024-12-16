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
import { NotificationSettingsEntity, NotificationType } from './noti-setting.entity';

@Entity('WATER_RANGE_SETTINGS')
export class WaterRangeSettingsEntity {
  @PrimaryColumn()
  UID: number;

  @PrimaryColumn({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column('time')
  START_TIME: Date;

  @Column('time')
  END_TIME: Date;

  @Column()
  GLASSES_PER_DAY: number;

  @Column()
  INTERVAL_MINUTES: number;

  @OneToOne(
    (type) => NotificationSettingsEntity,
    (notification) => notification.waterRangeSettings,
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