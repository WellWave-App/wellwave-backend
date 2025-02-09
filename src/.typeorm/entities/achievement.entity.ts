import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AchievementLevel } from './achievement_level.entity';

export enum AchievementType {
  LEVELED = 'leveled',
  SINGLE = 'single',
  LIMITED_EDITION = 'limited_edition',
}

@Entity('ACHIEVEMENTS')
export class Achievement {
  // /*
  // // * main
  // id: string,
  // title: string
  // description: string
  // achievement_type: enum('leveled', 'single', 'limited_edition')
  // level: ach_level
  // requirements: ach_level.requirement_tracking
  // icon_url
  // // * ach_level
  // level: number
  // taget_value: number
  // requirement_tracking (depend on level) : {
  //   from_entity: entity_name,
  //   track_property: property to track on that entity
  //   tracking_type: how property was track for success
  // }
  // // *user_achieved
  // ach_id
  // uid
  // achieved_date
  // */

  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  ID: string;

  @Column({ name: 'TITLE', type: 'varchar' })
  TITLE: string;

  @Column({ name: 'DESCRIPTION', type: 'text' })
  DESCRIPTION: string;

  @Column({
    type: 'enum',
    enum: AchievementType,
  })
  ACHIEVEMENTS_TYPE: AchievementType;

  @Column('jsonb', { name: 'REQUIREMENT' })
  REQUIREMENT: {
    FROM_ENTITY: string;
    TRACK_PROPERTY: string;
    TRACKING_TYPE: string;
    RESET_CONDITIONS?: string;
  };

  @Column('jsonb', { name: 'TIME_CONSTRAINT', nullable: true })
  TIME_CONSTRAINT?: {
    START_DATE: Date;
    END_DATE: Date;
    DATE: string;
  };

  @Column('jsonb', { name: 'PREREQUISITES', nullable: true })
  PREREQUISITES?: {
    REQUIRED_ACHIEVEMENTS?: string[];
    REQUIRED_MISSIONS?: number;
  };

  @Column('varchar', { name: 'ICON_URL', nullable: true })
  ICON_URL?: string;

  @OneToMany(() => AchievementLevel, (level) => level.achievement)
  levels: AchievementLevel[];
}
