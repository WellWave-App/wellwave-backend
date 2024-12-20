import { UserEntity } from '@/.typeorm/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import {
  NotificationSettingsEntity,
  NotificationType,
} from './noti-setting.entity';

@Entity('WATER_PLAN')
export class WaterPlanSettingEntity {
  @PrimaryColumn()
  GLASS_NUMBER: number;

  @PrimaryColumn()
  UID: number;

  @Column({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column('time')
  NOTI_TIME: Date;

  @ManyToOne(
    (type) => NotificationSettingsEntity,
    (notification) => notification.waterPlanSetting,
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
