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
import { WaterPlanSettingEntity } from './noti-water-plan.entity';
import { BedtimeSettingsEntity } from './noti-bedtime-setting.entity';
import { WaterRangeSettingsEntity } from './noti-water-range.entity';

export enum NotificationType {
  WATER_RANGE = 'WATER_RANGE',
  WATER_PLAN = 'WATER_PLAN',
  BEDTIME = 'BEDTIME',
}

@Entity('NOTIFICATION_SETTINGS')
export class NotificationSettingsEntity {
  @PrimaryColumn()
  UID: number;

  @PrimaryColumn({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column()
  IS_ACTIVE: boolean;

  @Column('timestamp')
  CREATE_AT: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UID' })
  user: UserEntity;

  @OneToOne(
    (type) => BedtimeSettingsEntity,
    (bedtime) => bedtime.notificationSetting,
  )
  bedtimeSettings: BedtimeSettingsEntity;

  @OneToOne(
    (type) => WaterRangeSettingsEntity,
    (waterRange) => waterRange.notificationSetting,
  )
  waterRangeSettings: WaterRangeSettingsEntity;

  @OneToMany(
    (type) => WaterPlanSettingEntity,
    (waterTimes) => waterTimes.notificationSetting,
  )
  waterPlanSetting: WaterPlanSettingEntity[];
}
