import { QUEST_TYPE } from '../../.typeorm/entities/quest.entity';
import { QuestTemplate } from './quest-template.interface';

export const QUEST_TEMPLATES: Record<string, QuestTemplate> = {
  // Exercise Quest Templates
  'daily-exercise-30': {
    QUEST_TYPE: QUEST_TYPE.EXERCISE_DURATION,
    QUEST_TITLE: 'Daily Exercise Champion',
    DESCRIPTION: 'Exercise for 30 minutes every day for a week',
    QUEST_DAY_DURATION: 7,
    EXP_REWARDS: 100,
    GEM_REWARDS: 50,
    DIFFICULTY: 'EASY',
    requirements: {
      targetValue: 30,
      additionalParams: {
        frequency: 'DAILY',
      },
    },
  },
  'exercise-streak-5': {
    QUEST_TYPE: QUEST_TYPE.EXERCISE_STREAK,
    QUEST_TITLE: 'Exercise Streak Master',
    DESCRIPTION: 'Complete exercise habits for 5 consecutive days',
    QUEST_DAY_DURATION: 5,
    EXP_REWARDS: 150,
    GEM_REWARDS: 75,
    DIFFICULTY: 'MEDIUM',
    requirements: {
      targetValue: 5,
    },
  },
  'calorie-burn-1000': {
    QUEST_TYPE: QUEST_TYPE.EXERCISE_CALORIES,
    QUEST_TITLE: 'Calorie Burner',
    DESCRIPTION: 'Burn 1000 calories through exercise this week',
    QUEST_DAY_DURATION: 7,
    EXP_REWARDS: 200,
    GEM_REWARDS: 100,
    DIFFICULTY: 'HARD',
    requirements: {
      targetValue: 1000,
    },
  },

  // Diet Quest Templates
  'water-daily-8': {
    QUEST_TYPE: QUEST_TYPE.WATER_INTAKE,
    QUEST_TITLE: 'Hydration Hero',
    DESCRIPTION: 'Drink 8 glasses of water daily for 3 days',
    QUEST_DAY_DURATION: 3,
    EXP_REWARDS: 75,
    GEM_REWARDS: 30,
    DIFFICULTY: 'EASY',
    requirements: {
      targetValue: 8,
      additionalParams: {
        frequency: 'DAILY',
      },
    },
  },
  'healthy-meals-15': {
    QUEST_TYPE: QUEST_TYPE.DIET_SESSIONS,
    QUEST_TITLE: 'Healthy Meal Streak',
    DESCRIPTION: 'Log 15 healthy meals in a week',
    QUEST_DAY_DURATION: 7,
    EXP_REWARDS: 150,
    GEM_REWARDS: 75,
    DIFFICULTY: 'MEDIUM',
    requirements: {
      targetValue: 15,
    },
  },

  // Sleep Quest Templates
  'sleep-8hours-7days': {
    QUEST_TYPE: QUEST_TYPE.SLEEP_DURATION,
    QUEST_TITLE: 'Sleep Well Champion',
    DESCRIPTION: 'Get 8 hours of sleep for 7 consecutive days',
    QUEST_DAY_DURATION: 7,
    EXP_REWARDS: 200,
    GEM_REWARDS: 100,
    DIFFICULTY: 'HARD',
    requirements: {
      targetValue: 8,
      additionalParams: {
        frequency: 'DAILY',
        minimumQuality: 0.7,
      },
    },
  },

  // Community Quest Templates
  'community-steps-100k': {
    QUEST_TYPE: QUEST_TYPE.COMMUNITY_STEPS,
    QUEST_TITLE: 'Community Step Challenge',
    DESCRIPTION: 'Contribute 100,000 steps to the community goal',
    QUEST_DAY_DURATION: 14,
    EXP_REWARDS: 300,
    GEM_REWARDS: 150,
    DIFFICULTY: 'HARD',
    requirements: {
      targetValue: 100000,
    },
  },

  // Achievement Quest Templates
  'unlock-3-achievements': {
    QUEST_TYPE: QUEST_TYPE.ACHIEVEMENT_COLLECTION,
    QUEST_TITLE: 'Achievement Hunter',
    DESCRIPTION: 'Unlock any 3 achievements',
    QUEST_DAY_DURATION: 14,
    EXP_REWARDS: 250,
    GEM_REWARDS: 125,
    DIFFICULTY: 'MEDIUM',
    requirements: {
      targetValue: 3,
    },
  },
};
