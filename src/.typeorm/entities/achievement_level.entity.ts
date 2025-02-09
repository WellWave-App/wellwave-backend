import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Achievement } from './achievement.entity';

@Entity('ACHIEVEMENT_LEVELS')
export class AchievementLevel {
  @PrimaryColumn({ name: 'ACH_ID', type: 'uuid' })
  ACH_ID: string;

  @PrimaryColumn({ name: 'LEVEL', type: 'int' })
  LEVEL: number;

  @Column({ name: 'TARGET_VALUE', type: 'float' })
  TARGET_VALUE: number;

  @ManyToOne(() => Achievement, (achievement) => achievement.levels, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ACH_ID' })
  achievement: Achievement;
}
