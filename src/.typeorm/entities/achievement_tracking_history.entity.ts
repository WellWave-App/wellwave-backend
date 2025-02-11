import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('achievement_tracking_history')
export class AchievementTrackingHistory {
  @PrimaryColumn('int', { name: 'UID' })
  UID: number;

  @PrimaryColumn('uuid', { name: 'ACH_ID' })
  ACH_ID: string;

  @PrimaryColumn('date', { name: 'TRACK_DATE' })
  TRACK_DATE: Date;

  @Column('float', { name: 'TRACK_VALUE' })
  TRACK_VALUE: number;

  @Column('jsonb', { name: 'METADATA', nullable: true })
  METADATA?: {
    SOURCE_ENTITY: string;
    ACTION_TYPE?: string;
    RELATE_ENTITY_ID?: string;
  };
}
