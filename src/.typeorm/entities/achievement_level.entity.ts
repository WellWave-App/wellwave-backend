import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Achievement } from './achievement.entity';
import { LeagueType } from '@/leagues/enum/lagues.enum';

@Entity('ACHIEVEMENT_LEVELS')
export class AchievementLevel {
  @PrimaryColumn({ name: 'ACH_ID', type: 'uuid' })
  ACH_ID: string;

  @Column('varchar', { name: 'ICON_URL', nullable: true })
  ICON_URL?: string;

  @PrimaryColumn({ name: 'LEVEL', type: 'int' })
  LEVEL: number;

  @Column({ name: 'TARGET_VALUE', type: 'float' })
  TARGET_VALUE: number;

  @Column({ name: 'LEAGUE', type: 'enum', enum: LeagueType, nullable: true })
  TARGET_LEAGUE?: LeagueType;

  @Column('jsonb', {
    name: 'REWARDS',
  })
  REWARDS: {
    EXP?: number;
    GEMS?: number;
  };

  @ManyToOne(() => Achievement, (achievement) => achievement.levels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ACH_ID' })
  achievement: Achievement;
}
