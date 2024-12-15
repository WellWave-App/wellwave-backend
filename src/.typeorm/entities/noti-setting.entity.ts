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

export enum NotificationType {
  WATER_RANGE = 'WATER_RANGE',
  WATER_INDIVIDUAL = 'WATER_INDIVIDUAL',
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

  // Relationship with User
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UID' })
  user: UserEntity;

  // Relationships with settings tables
  @OneToOne(() => BedtimeSettingsEntity, (bedtime) => bedtime.notificationSetting)
  bedtimeSettings: BedtimeSettingsEntity;

  @OneToOne(
    () => WaterRangeSettingsEntity,
    (waterRange) => waterRange.notificationSetting,
  )
  waterRangeSettings: WaterRangeSettingsEntity;

  @OneToMany(
    () => WaterIndividualTimesEntity,
    (waterTimes) => waterTimes.notificationSetting,
  )
  waterIndividualTimes: WaterIndividualTimesEntity[];

}

// WaterRangeSettings entity
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

  // Relationship with NotificationSettings
  @OneToOne(() => NotificationSettingsEntity)
  @JoinColumn([
    { name: 'UID', referencedColumnName: 'UID' },
    { name: 'NOTIFICATION_TYPE', referencedColumnName: 'NOTIFICATION_TYPE' },
  ])
  notificationSetting: NotificationSettingsEntity;
}

// WaterIndividualTimes entity
@Entity('WATER_INDIVIDUAL_TIMES')
export class WaterIndividualTimesEntity {
  @PrimaryGeneratedColumn()
  WATER_TIME_ID: number;

  @Column()
  UID: number;

  @Column({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column('time')
  NOTIFICATION_TIME: Date;

  @Column()
  GLASS_NUMBER: number;

  // Relationship with NotificationSettings
  @ManyToOne(() => NotificationSettingsEntity, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'UID', referencedColumnName: 'UID' },
    { name: 'NOTIFICATION_TYPE', referencedColumnName: 'NOTIFICATION_TYPE' },
  ])
  notificationSetting: NotificationSettingsEntity;
}

// BedtimeSettings entity
@Entity('BEDTIME_SETTINGS')
export class BedtimeSettingsEntity {
  @PrimaryColumn()
  UID: number;

  @PrimaryColumn({
    type: 'varchar',
    enum: NotificationType,
  })
  NOTIFICATION_TYPE: NotificationType;

  @Column('time')
  BEDTIME: Date;

  @Column('time')
  WAKE_TIME: Date;

  // @Column()
  // REMINDER_MINUTES: number;

  // Relationship with NotificationSettings
  @OneToOne(() => NotificationSettingsEntity)
  @JoinColumn([
    { name: 'UID', referencedColumnName: 'UID' },
    { name: 'NOTIFICATION_TYPE', referencedColumnName: 'NOTIFICATION_TYPE' },
  ])
  notificationSetting: NotificationSettingsEntity;
}
