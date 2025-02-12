import {
  Column,
  Entity,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AchievementLevel } from './achievement_level.entity';

// Achievement Types
export enum AchievementType {
  LEVELED = 'leveled', // Multiple levels (e.g., Perfect Week, EXP Olympian)
  SINGLE = 'single', // One-time achievements (e.g., League MVP)
  LIMITED_EDITION = 'limited_edition', // Time-bound achievements (e.g., Perfect Year 2024)
}

// Requirement Types
export enum RequirementTrackingType {
  STREAK = 'streak', // Consecutive activities (e.g., Perfect Week)
  CUMULATIVE = 'cumulative', // Total count (e.g., Article Reader)
  MILESTONE = 'milestone', // Specific accomplishments (e.g., League ranks)
  HIGH_SCORE = 'high_score', // Best performance (e.g., Most XP)
}

// Requirement Source Entities
export enum RequirementEntity {
  USER_LOGIN_STREAK = 'login_streak', // user login tracking
  USER_READ_HISTORY = 'user_read_history', // Article reading tracking
  USER_REACTIONS = 'user_reactions', // User reactions/cheers
  USER_FOLLOWS = 'user_follows', // Social follows
  USER_HABIT_CHALLENGES = 'user_habit_challenges', // Challenge completions
  USER = 'users', // Experience/Gems points
  USER_GEM_USAGE = 'user_gem_usage', // Gem spending
  USER_LOGS = 'user_logs', // User records/logs
  USER_MISSIONS = 'user_missions', // Mission completions
  USER_DAILY_MISSIONS = 'user_daily_missions', // Daily mission tracking
  // DIAMOND_LEAGUE_RANKINGS = 'diamond_league_rankings', // Diamond league specific
  // USER_LEAGUE = 'user_league', // League progression
  USER_LEADERBOARD = 'user_leaderboard', // General leaderboard
  // DAILY_USER_EXP = 'daily_user_exp', // Daily XP tracking
}

// Time Constraint Types
export enum TimeConstraintType {
  YEAR_SPECIFIC = 'year_specific', // Specific calendar year
  SEASON = 'season', // Seasonal events
  EVENT = 'event', // Special events
}

// Achievement Properties that can be tracked
export enum TrackableProperty {
  CURRENT_STREAK = 'current_streak',
  IS_READ = 'is_read',
  TOTAL_REACTIONS = 'total_reactions',
  FOLLOWING_COUNT = 'following_count',
  COMPLETED_CHALLENGES = 'is_complete',
  TOTAL_EXP = 'total_exp',
  TOTAL_GEMS_SPENT = 'total_gems_spent',
  COMPLETED_MISSIONS = 'completed_missions',
  DAILY_COMPLETION = 'daily_completion',
  RANK = 'rank',
  CURRENT_LEAGUE = 'current_league',
  // DAILY_EXP = 'daily_exp',
}

@Entity('ACHIEVEMENTS')
export class Achievement {
  @PrimaryGeneratedColumn('uuid', { name: 'ACH_ID' })
  ACH_ID: string;

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
    TRACKING_TYPE: RequirementTrackingType;
    EXCLUDE_LEAGUE?: string[];
    TARGET_VALUE?: number;
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

  @OneToMany(() => AchievementLevel, (level) => level.achievement, {
    onDelete: 'CASCADE',
  })
  levels?: AchievementLevel[];
}
