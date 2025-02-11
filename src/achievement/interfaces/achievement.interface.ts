import { RequirementEntity, RequirementTrackingType, TimeConstraintType } from "@/.typeorm/entities/achievement.entity";


// Interfaces for type safety
export interface RequirementTracking {
  from_entity: RequirementEntity;
  track_property: string;
  tracking_type: RequirementTrackingType;
  reset_condition?: 'break_streak' | string;
  target_value?: number; // For single-type achievements
  league?: string; // For league-specific requirements
  exclude_league?: string; // For league exclusions
  prerequisites?: string[]; // For dependent achievements
}

export interface TimeConstraint {
  start_date: Date;
  end_date: Date;
  type: TimeConstraintType;
}

// // League related types
// export enum LeagueType {
//   BRONZE = 'bronze',
//   SILVER = 'silver',
//   GOLD = 'gold',
//   EMERALD = 'emerald',
//   DIAMOND = 'diamond',
// }



/**
   // Example usage in entity:
  interface Achievement {
    id: string;
    title: string;
    achievement_type: AchievementType;
    requirement_tracking: RequirementTracking;
    time_constraint?: TimeConstraint;
  }
  
  // Example achievement using these types:
  const perfectWeekAchievement: Achievement = {
    id: 'perfect_week',
    title: 'สัปดาห์ที่สมบูรณ์แบบ',
    achievement_type: AchievementType.LEVELED,
    requirement_tracking: {
      from_entity: RequirementEntity.USER_APP_USAGE,
      track_property: TrackableProperty.CONSECUTIVE_WEEKS,
      tracking_type: RequirementTrackingType.STREAK,
      reset_condition: 'break_streak'
    }
  };
  
  const perfect2024Achievement: Achievement = {
    id: 'perfect_year_2024',
    title: 'ปีที่สมบูรณ์แบบ',
    achievement_type: AchievementType.LIMITED_EDITION,
    requirement_tracking: {
      from_entity: RequirementEntity.USER_DAILY_MISSIONS,
      track_property: TrackableProperty.DAILY_COMPLETION,
      tracking_type: RequirementTrackingType.STREAK,
      target_value: 366
    },
    time_constraint: {
      start_date: new Date('2024-01-01'),
      end_date: new Date('2024-12-31'),
      type: TimeConstraintType.YEAR_SPECIFIC
    }
  };
 */
