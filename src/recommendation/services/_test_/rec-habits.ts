import {
  Habits,
  HabitCategories,
  ExerciseType,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { User, USER_GOAL } from '@/.typeorm/entities/users.entity';
import { HabitRecommendService } from '../habits-recommendation.service';
import { LoginStreakEntity } from '@/.typeorm/entities/login-streak.entity';
import { Role } from '@/auth/roles/roles.enum';
import { UserLeaderboard } from '@/.typeorm/entities/user-leaderboard.entity';
import { PrivateSetting } from '@/.typeorm/entities/user-privacy.entity';

// Sample Habits Data
export const testHabits: Habits[] = [
  {
    HID: 1,
    TITLE: 'Morning Walk',
    DESCRIPTION: '30-minute morning walk to start your day',
    ADVICE: 'Start slow and gradually increase pace',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.Walking,
    TRACKING_TYPE: TrackingType.Duration,
    EXP_REWARD: 50,
    GEM_REWARD: 10,
    DEFAULT_DAILY_MINUTE_GOAL: 30,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: true,
    THUMBNAIL_URL: 'walk.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 2,
    TITLE: 'Strength Training',
    DESCRIPTION: 'Basic strength exercises with bodyweight',
    ADVICE: 'Focus on proper form',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.Strength,
    TRACKING_TYPE: TrackingType.Duration,
    EXP_REWARD: 100,
    GEM_REWARD: 20,
    DEFAULT_DAILY_MINUTE_GOAL: 45,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: false,
    THUMBNAIL_URL: 'strength.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 3,
    TITLE: 'Balanced Diet',
    DESCRIPTION: 'Maintain a balanced diet with proper portions',
    ADVICE: 'Include all food groups in your meals',
    CATEGORY: HabitCategories.Diet,
    TRACKING_TYPE: TrackingType.Boolean,
    EXP_REWARD: 75,
    GEM_REWARD: 15,
    IS_DAILY: true,
    THUMBNAIL_URL: 'diet.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    EXERCISE_TYPE: ExerciseType.Walking,
    DEFAULT_DAILY_MINUTE_GOAL: 0,
    DEFAULT_DAYS_GOAL: 0,
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 4,
    TITLE: 'Regular Sleep Schedule',
    DESCRIPTION: 'Maintain consistent sleep and wake times',
    ADVICE: 'Aim for 7-8 hours of sleep',
    CATEGORY: HabitCategories.Sleep,
    TRACKING_TYPE: TrackingType.Boolean,
    EXP_REWARD: 50,
    GEM_REWARD: 10,
    IS_DAILY: true,
    THUMBNAIL_URL: 'sleep.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    EXERCISE_TYPE: ExerciseType.Walking,
    DEFAULT_DAILY_MINUTE_GOAL: 0,
    DEFAULT_DAYS_GOAL: 0,
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 5,
    TITLE: 'HIIT Workout',
    DESCRIPTION: 'High-intensity interval training',
    ADVICE: 'Start with shorter intervals',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.HIIT,
    TRACKING_TYPE: TrackingType.Duration,
    EXP_REWARD: 150,
    GEM_REWARD: 30,
    DEFAULT_DAILY_MINUTE_GOAL: 20,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: false,
    THUMBNAIL_URL: 'hiit.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 6,
    TITLE: 'Swimming',
    DESCRIPTION: 'Low-impact full-body workout',
    ADVICE: 'Start with basic strokes',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.Swimming,
    TRACKING_TYPE: TrackingType.Duration,
    EXP_REWARD: 100,
    GEM_REWARD: 20,
    DEFAULT_DAILY_MINUTE_GOAL: 30,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: false,
    THUMBNAIL_URL: 'swim.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 7,
    TITLE: 'Yoga Practice',
    DESCRIPTION: 'Gentle yoga for flexibility and mindfulness',
    ADVICE: 'Focus on breathing',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.Yoga,
    TRACKING_TYPE: TrackingType.Duration,
    EXP_REWARD: 75,
    GEM_REWARD: 15,
    DEFAULT_DAILY_MINUTE_GOAL: 20,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: true,
    THUMBNAIL_URL: 'yoga.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 8,
    TITLE: 'Low-Carb Diet',
    DESCRIPTION: 'Reduce carbohydrate intake',
    ADVICE: 'Focus on protein and healthy fats',
    CATEGORY: HabitCategories.Diet,
    TRACKING_TYPE: TrackingType.Boolean,
    EXP_REWARD: 100,
    GEM_REWARD: 20,
    IS_DAILY: true,
    THUMBNAIL_URL: 'lowcarb.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    EXERCISE_TYPE: ExerciseType.Walking,
    DEFAULT_DAILY_MINUTE_GOAL: 0,
    DEFAULT_DAYS_GOAL: 0,
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 9,
    TITLE: 'Cycling',
    DESCRIPTION: 'Outdoor or stationary cycling',
    ADVICE: 'Maintain steady pace',
    CATEGORY: HabitCategories.Exercise,
    EXERCISE_TYPE: ExerciseType.Cycling,
    TRACKING_TYPE: TrackingType.Distance,
    EXP_REWARD: 100,
    GEM_REWARD: 20,
    DEFAULT_DAILY_MINUTE_GOAL: 45,
    DEFAULT_DAYS_GOAL: 30,
    IS_DAILY: false,
    THUMBNAIL_URL: 'cycling.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
  {
    HID: 10,
    TITLE: 'Protein-Rich Diet',
    DESCRIPTION: 'High protein diet for muscle building',
    ADVICE: 'Include protein in every meal',
    CATEGORY: HabitCategories.Diet,
    TRACKING_TYPE: TrackingType.Boolean,
    EXP_REWARD: 100,
    GEM_REWARD: 20,
    IS_DAILY: true,
    THUMBNAIL_URL: 'protein.jpg',
    CONDITIONS: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
    EXERCISE_TYPE: ExerciseType.Walking,
    DEFAULT_DAILY_MINUTE_GOAL: 0,
    DEFAULT_DAYS_GOAL: 0,
    CREATED_AT: undefined,
    UPDATED_AT: undefined
  },
];

// Sample Users with different risk profiles
export const testUsers: User[] = [
  {
    // Healthy young user focused on muscle building
    UID: 1,
    USERNAME: 'john_fitness',
    EMAIL: 'john@example.com',
    YEAR_OF_BIRTH: 1995,
    GENDER: true,
    HEIGHT: 175,
    WEIGHT: 70,
    USER_GOAL: USER_GOAL.BUILD_MUSCLE,
    habits: [],
    RiskAssessment: {
      RA_ID: 1,
      DIABETES: 1,
      HYPERTENSION: 0,
      DYSLIPIDEMIA: 1,
      OBESITY: 0,
      DIASTOLIC_BLOOD_PRESSURE: 75,
      SYSTOLIC_BLOOD_PRESSURE: 120,
      HDL: 50,
      LDL: 100,
      WAIST_LINE: 82,
      HAS_SMOKE: false,
      HAS_DRINK: false,
      UID: 1,
      createAt: new Date(),
      USER: null,
    },
    hashPassword: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    setPassword: function (password: string | undefined): void {
      throw new Error('Function not implemented.');
    },
    GEM: 0,
    EXP: 0,
    ROLE: Role.USER,
    USER_GOAL_STEP_WEEK: 0,
    USER_GOAL_EX_TIME_WEEK: 0,
    createAt: undefined,
    LOGS: [],
    articleReadHistory: [],
    loginStreak: new LoginStreakEntity(),
    quests: [],
    userAchieveds: [],
    notfications: [],
    league: new UserLeaderboard,
    userItems: [],
    privacy: new PrivateSetting
  },
  {
    // Middle-aged user with high health risks
    UID: 2,
    USERNAME: 'mary_health',
    EMAIL: 'mary@example.com',
    YEAR_OF_BIRTH: 1975,
    GENDER: false,
    HEIGHT: 165,
    WEIGHT: 85,
    USER_GOAL: USER_GOAL.LOSE_WEIGHT,
    habits: [],
    RiskAssessment: {
      RA_ID: 2,
      DIABETES: 7,
      HYPERTENSION: 2,
      DYSLIPIDEMIA: 3,
      OBESITY: 1,
      DIASTOLIC_BLOOD_PRESSURE: 90,
      SYSTOLIC_BLOOD_PRESSURE: 140,
      HDL: 35,
      LDL: 160,
      WAIST_LINE: 95,
      HAS_SMOKE: false,
      HAS_DRINK: false,
      UID: 2,
      createAt: new Date(),
      USER: null,
    },
    hashPassword: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    setPassword: function (password: string | undefined): void {
      throw new Error('Function not implemented.');
    },
    GEM: 0,
    EXP: 0,
    ROLE: Role.USER,
    USER_GOAL_STEP_WEEK: 0,
    USER_GOAL_EX_TIME_WEEK: 0,
    createAt: undefined,
    LOGS: [],
    articleReadHistory: [],
    loginStreak: new LoginStreakEntity(),
    quests: [],
    userAchieveds: [],
    notfications: [],
    league: new UserLeaderboard,
    userItems: [],
    privacy: new PrivateSetting
  },
  {
    // Young user with moderate risks focusing on general health
    UID: 3,
    USERNAME: 'alex_balanced',
    EMAIL: 'alex@example.com',
    YEAR_OF_BIRTH: 1990,
    GENDER: true,
    HEIGHT: 180,
    WEIGHT: 75,
    USER_GOAL: USER_GOAL.STAY_HEALTHY,
    habits: [],
    RiskAssessment: {
      RA_ID: 3,
      DIABETES: 4,
      HYPERTENSION: 1,
      DYSLIPIDEMIA: 2,
      OBESITY: 0,
      DIASTOLIC_BLOOD_PRESSURE: 80,
      SYSTOLIC_BLOOD_PRESSURE: 125,
      HDL: 45,
      LDL: 130,
      WAIST_LINE: 88,
      HAS_SMOKE: true,
      HAS_DRINK: true,
      UID: 3,
      createAt: new Date(),
      USER: null,
    },
    hashPassword: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    setPassword: function (password: string | undefined): void {
      throw new Error('Function not implemented.');
    },
    GEM: 0,
    EXP: 0,
    ROLE: Role.USER,
    USER_GOAL_STEP_WEEK: 0,
    USER_GOAL_EX_TIME_WEEK: 0,
    createAt: undefined,
    LOGS: [],
    articleReadHistory: [],
    loginStreak: new LoginStreakEntity(),
    quests: [],
    userAchieveds: [],
    notfications: [],
    league: new UserLeaderboard,
    userItems: [],
    privacy: new PrivateSetting
  },
  {
    // Elderly user with multiple health conditions
    UID: 4,
    USERNAME: 'robert_senior',
    EMAIL: 'robert@example.com',
    YEAR_OF_BIRTH: 1955,
    GENDER: true,
    HEIGHT: 170,
    WEIGHT: 90,
    USER_GOAL: USER_GOAL.STAY_HEALTHY,
    habits: [],
    RiskAssessment: {
      RA_ID: 4,
      DIABETES: 8,
      HYPERTENSION: 2,
      DYSLIPIDEMIA: 4,
      OBESITY: 1,
      DIASTOLIC_BLOOD_PRESSURE: 95,
      SYSTOLIC_BLOOD_PRESSURE: 150,
      HDL: 30,
      LDL: 170,
      WAIST_LINE: 102,
      HAS_SMOKE: false,
      HAS_DRINK: false,
      UID: 4,
      createAt: new Date(),
      USER: null,
    },
    hashPassword: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    setPassword: function (password: string | undefined): void {
      throw new Error('Function not implemented.');
    },
    GEM: 0,
    EXP: 0,
    ROLE: Role.USER,
    USER_GOAL_STEP_WEEK: 0,
    USER_GOAL_EX_TIME_WEEK: 0,
    createAt: undefined,
    LOGS: [],
    articleReadHistory: [],
    loginStreak: new LoginStreakEntity(),
    quests: [],
    userAchieveds: [],
    notfications: [],
    league: new UserLeaderboard,
    userItems: [],
    privacy: new PrivateSetting
  },
  {
    // Athletic young user with low risks
    UID: 5,
    USERNAME: 'sarah_athlete',
    EMAIL: 'sarah@example.com',
    YEAR_OF_BIRTH: 1997,
    GENDER: false,
    HEIGHT: 168,
    WEIGHT: 58,
    USER_GOAL: USER_GOAL.BUILD_MUSCLE,
    habits: [],
    RiskAssessment: {
      RA_ID: 5,
      DIABETES: 1,
      HYPERTENSION: 0,
      DYSLIPIDEMIA: 1,
      OBESITY: 0,
      DIASTOLIC_BLOOD_PRESSURE: 70,
      SYSTOLIC_BLOOD_PRESSURE: 115,
      HDL: 60,
      LDL: 90,
      WAIST_LINE: 75,
      HAS_SMOKE: false,
      HAS_DRINK: false,
      UID: 5,
      createAt: new Date(),
      USER: null,
    },
    hashPassword: function (): Promise<void> {
      throw new Error('Function not implemented.');
    },
    setPassword: function (password: string | undefined): void {
      throw new Error('Function not implemented.');
    },
    GEM: 0,
    EXP: 0,
    ROLE: Role.USER,
    USER_GOAL_STEP_WEEK: 0,
    USER_GOAL_EX_TIME_WEEK: 0,
    createAt: undefined,
    LOGS: [],
    articleReadHistory: [],
    loginStreak: new LoginStreakEntity(),
    quests: [],
    userAchieveds: [],
    notfications: [],
    league: new UserLeaderboard,
    userItems: [],
    privacy: new PrivateSetting
  },
];

// Test function to demonstrate recommendation system
// export async function testRecommendationSystem() {
//   for (const user of testUsers) {
//     console.log(`\nRecommendations for ${user.USERNAME}:`);
//     console.log(
//       `Risk Profile: Diabetes=${user.RiskAssessment.DIABETES}, Hypertension=${user.RiskAssessment.HYPERTENSION}, DYSLIPIDEMIA=${user.RiskAssessment.DYSLIPIDEMIA}, OBESITY=${user.RiskAssessment.OBESITY}`,
//     );
//     console.log(`Goal: ${USER_GOAL[user.USER_GOAL]}`);

//     const recommendations = await HabitRecommendService.recommendHabits(
//       testHabits,
//       user,
//       testUsers,
//       3, // Get top 3 recommendations
//     );

//     console.log('Recommended Habits:');
//     recommendations.forEach((habit, index) => {
//       console.log(`${index + 1}. ${habit.TITLE} (${habit.CATEGORY})`);
//     });
//   }

//   const recommendations = await HabitRecommendService.recommendHabits(
//     testHabits,
//     testUsers[0],
//     testUsers,
//     4, // Get top 3 recommendations
//   );

//   return recommendations;
// }
