import { v4 as uuidv4 } from 'uuid';
import {
  Achievement,
  AchievementType,
  RequirementEntity,
  RequirementTrackingType,
  TrackableProperty,
} from '../entities/achievement.entity';
import { AchievementLevel } from '../entities/achievement_level.entity';

// Helper function to create UUID
const generateId = () => uuidv4();
// League related types
enum LeagueType {
  NONE = 'none',
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  EMERALD = 'emerald',
  DIAMOND = 'diamond',
}

// Map of achievement IDs to generated UUIDs
const achievementIds = {
  perfect_week: generateId(),
  exp_olympian: generateId(),
  article_reader: generateId(),
  cheerleader: generateId(),
  social_persona: generateId(),
  legend: generateId(),
  league_mvp: generateId(),
  rarest_diamond: generateId(),
  highest_league: generateId(),
  champion: generateId(),
  proud_exchanger: generateId(),
  top_scribe: generateId(),
  health_lover: generateId(),
  perfect_year: generateId(),
  year_of_dragon: generateId(),
  year_of_viper: generateId(),
};

export const achievementSeeds: Partial<Achievement>[] = [
  {
    ACH_ID: achievementIds.perfect_week, // *intregated
    TITLE: 'สัปดาห์ที่สมบูรณ์แบบ',
    DESCRIPTION: 'เข้าใช้งาน WellWave ครบ X สัปดาห์ติดต่อกัน',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LOGIN_STREAK,
      TRACK_PROPERTY: TrackableProperty.CURRENT_STREAK,
      TRACKING_TYPE: RequirementTrackingType.STREAK,
    },
  },
  {
    ACH_ID: achievementIds.exp_olympian, // *intregated
    TITLE: 'EXP Olympian',
    DESCRIPTION: 'รับ XP ตามเป้าหมายที่กำหนด',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER,
      TRACK_PROPERTY: TrackableProperty.TOTAL_EXP,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.article_reader,
    TITLE: 'ยอดนักอ่าน',
    DESCRIPTION: 'อ่านบทความเกี่ยวกับสุขภาพผ่านแอพพลิเคชั่น',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_READ_HISTORY,
      TRACK_PROPERTY: TrackableProperty.TOTAL_READ,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.cheerleader,
    TITLE: 'เชียร์ลีดเดอร์',
    DESCRIPTION: 'แสดงความยินดีกับผู้ใช้รายอื่น',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_REACTIONS,
      TRACK_PROPERTY: TrackableProperty.TOTAL_REACTIONS,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.social_persona,
    TITLE: 'คนของสังคม',
    DESCRIPTION: 'ติดตามเพื่อนผู้ใช้งานคนอื่น',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_FOLLOWS,
      TRACK_PROPERTY: TrackableProperty.FOLLOWING_COUNT,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.legend,
    TITLE: 'ยอดตำนาน',
    DESCRIPTION: 'สำเร็จตามเป้าหมายที่กำหนดไว้',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_HABIT_CHALLENGES,
      TRACK_PROPERTY: TrackableProperty.TOTAL_COMPLETED_HABIT,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.league_mvp,
    TITLE: 'League MVP',
    DESCRIPTION: 'เป็นที่ 1 ใน Leaderboard',
    ACHIEVEMENTS_TYPE: AchievementType.SINGLE,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LEADERBOARD,
      TRACK_PROPERTY: TrackableProperty.CURRENT_RANK,
      TRACKING_TYPE: RequirementTrackingType.MILESTONE,

      EXCLUDE_LEAGUE: [LeagueType.NONE, LeagueType.DIAMOND],
    },
  },
  {
    ACH_ID: achievementIds.rarest_diamond,
    TITLE: 'เพชรที่หายากที่สุด',
    DESCRIPTION: 'อันดับ #1 ในไดมอนด์ลีกครั้งแรก',
    ACHIEVEMENTS_TYPE: AchievementType.SINGLE,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LEADERBOARD,
      TRACK_PROPERTY: TrackableProperty.CURRENT_RANK,
      TRACKING_TYPE: RequirementTrackingType.MILESTONE,
      EXCLUDE_LEAGUE: [
        LeagueType.NONE,
        LeagueType.BRONZE,
        LeagueType.SILVER,
        LeagueType.GOLD,
        LeagueType.EMERALD,
      ],
    },
  },
  {
    ACH_ID: achievementIds.highest_league,
    TITLE: 'Highest League',
    DESCRIPTION: 'แสดงตำแหน่งสูงสุดที่จบใน League นั้นๆ',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LEADERBOARD,
      TRACK_PROPERTY: TrackableProperty.LEAGUE_REACHED,
      TRACKING_TYPE: RequirementTrackingType.MILESTONE,
    },
  },
  {
    ACH_ID: achievementIds.champion,
    TITLE: 'Champion',
    DESCRIPTION: 'ปลดล็อก Leaderboards โดยสำเร็จภารกิจ',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LEADERBOARD,
      TRACK_PROPERTY: TrackableProperty.CURRENT_LEAGUE,
      TRACKING_TYPE: RequirementTrackingType.MILESTONE,
    },
    PREREQUISITES: {
      REQUIRED_MISSIONS: 10,
    },
  },
  {
    ACH_ID: achievementIds.proud_exchanger, // *intregated
    TITLE: 'ครั้งยิ่งใหญ่',
    DESCRIPTION: 'ใช้ Gem แลกรางวัล',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_GEM_USAGE,
      TRACK_PROPERTY: TrackableProperty.TOTAL_GEMS_SPENT,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.top_scribe,
    TITLE: 'นักจดชั้นนำ',
    DESCRIPTION: 'จดบันทึกค่าในระบบครบตามระยะเวลา',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_LOGS,
      TRACK_PROPERTY: TrackableProperty.CONSECUTIVE_WEEKS,
      TRACKING_TYPE: RequirementTrackingType.STREAK,
    },
  },
  {
    ACH_ID: achievementIds.health_lover,
    TITLE: 'Health Lover',
    DESCRIPTION: 'ออกกำลังกายถึงเวลาที่กำหนดไว้',
    ACHIEVEMENTS_TYPE: AchievementType.LEVELED,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_HABIT_CHALLENGES,
      TRACK_PROPERTY: TrackableProperty.TOTAL_EXERCISE_MINUTE,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
  },
  {
    ACH_ID: achievementIds.perfect_year,
    TITLE: 'ปีที่สมบูรณ์แบบ',
    DESCRIPTION: 'ทำภารกิจทุกวันในปี 2025',
    ACHIEVEMENTS_TYPE: AchievementType.LIMITED_EDITION,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_HABIT_CHALLENGES,
      TRACK_PROPERTY: TrackableProperty.CONSECUTIVE_WEEKS,
      TRACKING_TYPE: RequirementTrackingType.STREAK,
    },
    TIME_CONSTRAINT: {
      START_DATE: new Date('2025-01-01'),
      END_DATE: new Date('2025-12-31'),
    },
  },
  {
    ACH_ID: achievementIds.year_of_dragon,
    TITLE: 'พญามังกร',
    DESCRIPTION: 'เสร็จสิ้น 30 ภารกิจในปี 2025',
    ACHIEVEMENTS_TYPE: AchievementType.LIMITED_EDITION,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_MISSIONS,
      TRACK_PROPERTY: TrackableProperty.COMPLETED_MISSION,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
    TIME_CONSTRAINT: {
      START_DATE: new Date('2025-01-01'),
      END_DATE: new Date('2025-12-31'),
    },
  },
  {
    ACH_ID: achievementIds.year_of_viper,
    TITLE: 'งูผู้ฉลาดปราดเปรื่อง',
    DESCRIPTION: 'อ่านบทความครบ 52 บทความในปี 2025',
    ACHIEVEMENTS_TYPE: AchievementType.LIMITED_EDITION,
    REQUIREMENT: {
      FROM_ENTITY: RequirementEntity.USER_READ_HISTORY,
      TRACK_PROPERTY: TrackableProperty.TOTAL_READ,
      TRACKING_TYPE: RequirementTrackingType.CUMULATIVE,
    },
    TIME_CONSTRAINT: {
      START_DATE: new Date('2025-01-01'),
      END_DATE: new Date('2025-12-31'),
    },
  },
];

// Default rewards per level
const defaultRewards = [
  { EXP: 10, GEMS: 5 }, // Level 1
  { EXP: 20, GEMS: 10 }, // Level 2
  { EXP: 30, GEMS: 15 }, // Level 3
  { EXP: 40, GEMS: 20 }, // Level 4
  { EXP: 50, GEMS: 25 }, // Level 5
];

export const achievementLevelSeeds: Partial<AchievementLevel>[] = [
  // Perfect Week Levels
  {
    ACH_ID: achievementIds.perfect_week,
    LEVEL: 1,
    TARGET_VALUE: 7,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.perfect_week,
    LEVEL: 2,
    TARGET_VALUE: 21,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.perfect_week,
    LEVEL: 3,
    TARGET_VALUE: 30,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.perfect_week,
    LEVEL: 4,
    TARGET_VALUE: 70,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.perfect_week,
    LEVEL: 5,
    TARGET_VALUE: 140,
    REWARDS: defaultRewards[4],
  },

  // EXP Olympian Levels
  {
    ACH_ID: achievementIds.exp_olympian,
    LEVEL: 1,
    TARGET_VALUE: 100,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.exp_olympian,
    LEVEL: 2,
    TARGET_VALUE: 250,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.exp_olympian,
    LEVEL: 3,
    TARGET_VALUE: 500,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.exp_olympian,
    LEVEL: 4,
    TARGET_VALUE: 1000,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.exp_olympian,
    LEVEL: 5,
    TARGET_VALUE: 3000,
    REWARDS: defaultRewards[4],
  },

  // Article Reader Levels
  {
    ACH_ID: achievementIds.article_reader,
    LEVEL: 1,
    TARGET_VALUE: 5,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.article_reader,
    LEVEL: 2,
    TARGET_VALUE: 10,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.article_reader,
    LEVEL: 3,
    TARGET_VALUE: 15,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.article_reader,
    LEVEL: 4,
    TARGET_VALUE: 20,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.article_reader,
    LEVEL: 5,
    TARGET_VALUE: 25,
    REWARDS: defaultRewards[4],
  },

  // Cheerleader Levels
  {
    ACH_ID: achievementIds.cheerleader,
    LEVEL: 1,
    TARGET_VALUE: 5,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.cheerleader,
    LEVEL: 2,
    TARGET_VALUE: 10,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.cheerleader,
    LEVEL: 3,
    TARGET_VALUE: 20,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.cheerleader,
    LEVEL: 4,
    TARGET_VALUE: 25,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.cheerleader,
    LEVEL: 5,
    TARGET_VALUE: 100,
    REWARDS: defaultRewards[4],
  },

  // Social Persona Levels
  {
    ACH_ID: achievementIds.social_persona,
    LEVEL: 1,
    TARGET_VALUE: 3,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.social_persona,
    LEVEL: 2,
    TARGET_VALUE: 10,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.social_persona,
    LEVEL: 3,
    TARGET_VALUE: 20,
    REWARDS: defaultRewards[2],
  },

  // Legend Levels
  {
    ACH_ID: achievementIds.legend,
    LEVEL: 1,
    TARGET_VALUE: 1,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.legend,
    LEVEL: 2,
    TARGET_VALUE: 3,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.legend,
    LEVEL: 3,
    TARGET_VALUE: 5,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.legend,
    LEVEL: 4,
    TARGET_VALUE: 7,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.legend,
    LEVEL: 5,
    TARGET_VALUE: 10,
    REWARDS: defaultRewards[4],
  },

  // League MVP Level
  {
    ACH_ID: achievementIds.league_mvp,
    LEVEL: 1,
    TARGET_VALUE: 1,
    REWARDS: { EXP: 50, GEMS: 25 },
  },

  // Rarest Diamond Level
  {
    ACH_ID: achievementIds.rarest_diamond,
    LEVEL: 1,
    TARGET_VALUE: 1,
    TARGET_LEAGUE: LeagueType.DIAMOND,
    REWARDS: { EXP: 100, GEMS: 50 },
  },

  // Highest League Levels
  {
    ACH_ID: achievementIds.highest_league,
    LEVEL: 1,
    TARGET_VALUE: 1,
    TARGET_LEAGUE: LeagueType.BRONZE,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.highest_league,
    LEVEL: 2,
    TARGET_VALUE: 2,
    TARGET_LEAGUE: LeagueType.SILVER,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.highest_league,
    LEVEL: 3,
    TARGET_VALUE: 3,
    TARGET_LEAGUE: LeagueType.GOLD,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.highest_league,
    LEVEL: 4,
    TARGET_VALUE: 4,
    TARGET_LEAGUE: LeagueType.EMERALD,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.highest_league,
    LEVEL: 5,
    TARGET_VALUE: 5,
    TARGET_LEAGUE: LeagueType.DIAMOND,
    REWARDS: defaultRewards[4],
  },

  // Champion Levels
  {
    ACH_ID: achievementIds.champion,
    LEVEL: 1,
    TARGET_VALUE: 1,
    TARGET_LEAGUE: LeagueType.BRONZE,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.champion,
    LEVEL: 2,
    TARGET_VALUE: 2,
    TARGET_LEAGUE: LeagueType.SILVER,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.champion,
    LEVEL: 3,
    TARGET_VALUE: 3,
    TARGET_LEAGUE: LeagueType.GOLD,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.champion,
    LEVEL: 4,
    TARGET_VALUE: 4,
    TARGET_LEAGUE: LeagueType.EMERALD,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.champion,
    LEVEL: 5,
    TARGET_VALUE: 5,
    TARGET_LEAGUE: LeagueType.DIAMOND,
    REWARDS: defaultRewards[4],
  },

  // Proud Exchanger Levels
  {
    ACH_ID: achievementIds.proud_exchanger,
    LEVEL: 1,
    TARGET_VALUE: 100,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.proud_exchanger,
    LEVEL: 2,
    TARGET_VALUE: 300,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.proud_exchanger,
    LEVEL: 3,
    TARGET_VALUE: 500,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.proud_exchanger,
    LEVEL: 4,
    TARGET_VALUE: 700,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.proud_exchanger,
    LEVEL: 5,
    TARGET_VALUE: 1000,
    REWARDS: defaultRewards[4],
  },

  // Top Scribe Levels
  {
    ACH_ID: achievementIds.top_scribe,
    LEVEL: 1,
    TARGET_VALUE: 3,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.top_scribe,
    LEVEL: 2,
    TARGET_VALUE: 5,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.top_scribe,
    LEVEL: 3,
    TARGET_VALUE: 7,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.top_scribe,
    LEVEL: 4,
    TARGET_VALUE: 10,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.top_scribe,
    LEVEL: 5,
    TARGET_VALUE: 12,
    REWARDS: defaultRewards[4],
  },

  // Health Lover Levels
  {
    ACH_ID: achievementIds.health_lover,
    LEVEL: 1,
    TARGET_VALUE: 150,
    REWARDS: defaultRewards[0],
  },
  {
    ACH_ID: achievementIds.health_lover,
    LEVEL: 2,
    TARGET_VALUE: 300,
    REWARDS: defaultRewards[1],
  },
  {
    ACH_ID: achievementIds.health_lover,
    LEVEL: 3,
    TARGET_VALUE: 900,
    REWARDS: defaultRewards[2],
  },
  {
    ACH_ID: achievementIds.health_lover,
    LEVEL: 4,
    TARGET_VALUE: 3600,
    REWARDS: defaultRewards[3],
  },
  {
    ACH_ID: achievementIds.health_lover,
    LEVEL: 5,
    TARGET_VALUE: 18000,
    REWARDS: defaultRewards[4],
  },

  // Perfect Year Level
  {
    ACH_ID: achievementIds.perfect_year,
    LEVEL: 1,
    TARGET_VALUE: 52,
    REWARDS: { EXP: 100, GEMS: 50 },
  },

  // Year of Dragon Level
  {
    ACH_ID: achievementIds.year_of_dragon,
    LEVEL: 1,
    TARGET_VALUE: 30,
    REWARDS: { EXP: 100, GEMS: 50 },
  },

  // Year of Viper Level
  {
    ACH_ID: achievementIds.year_of_viper,
    LEVEL: 1,
    TARGET_VALUE: 52,
    REWARDS: { EXP: 100, GEMS: 50 },
  },
];
