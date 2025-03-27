import { ExerciseType } from '@/.typeorm/entities/habit.entity';
import { User } from '@/.typeorm/entities/users.entity';

export class ExerciseCalculator {
  static calculateSteps(
    duration: number,
    exerciseType: ExerciseType,
    user: User,
  ): number {
    if (!duration || duration < 0) return 0;

    const stepsPerMinute = {
      [ExerciseType.Walking]: 110,
      [ExerciseType.Running]: 160,
      [ExerciseType.Cycling]: 0,
      [ExerciseType.Swimming]: 0,
      [ExerciseType.Strength]: 30,
      [ExerciseType.HIIT]: 120,
      [ExerciseType.Yoga]: 20,
      [ExerciseType.Other]: 50,
    };

    return Math.max(0, Math.round(duration * stepsPerMinute[exerciseType]));
  }

  static calculateCaloriesBurned(
    duration: number,
    exerciseType: ExerciseType,
    user: User,
  ): number {
    if (!duration || duration < 0) return 0;
    if (!user.WEIGHT || !user.HEIGHT || !user.YEAR_OF_BIRTH) return 0;

    const metValues = {
      [ExerciseType.Walking]: 3.5,
      [ExerciseType.Running]: 8.0,
      [ExerciseType.Cycling]: 7.0,
      [ExerciseType.Swimming]: 6.0,
      [ExerciseType.Strength]: 5.0,
      [ExerciseType.HIIT]: 8.0,
      [ExerciseType.Yoga]: 3.0,
      [ExerciseType.Other]: 4.0,
    };

    const age = new Date().getFullYear() - user.YEAR_OF_BIRTH;

    // Validate inputs
    if (age < 0 || age > 120) return 0;
    if (user.WEIGHT < 20 || user.WEIGHT > 300) return 0;
    if (user.HEIGHT < 100 || user.HEIGHT > 250) return 0;

    const bmr = user.GENDER
      ? 66.47 + 13.75 * user.WEIGHT + 5.003 * user.HEIGHT - 6.755 * age
      : 655.1 + 9.563 * user.WEIGHT + 1.85 * user.HEIGHT - 4.676 * age;

    const met = metValues[exerciseType];
    const caloriesPerMinute = (bmr / 24 / 60) * met;

    return Math.max(0, Math.round(caloriesPerMinute * duration));
  }

  static calculateHeartRate(
    // renamed from calculateEstimateHeartRate
    exerciseType: ExerciseType,
    user: User,
    intensity: number = 0.7,
  ): number {
    if (!user.YEAR_OF_BIRTH) return 0;

    const age = new Date().getFullYear() - user.YEAR_OF_BIRTH;

    // Validate inputs
    if (age < 0 || age > 120) return 0;

    const maxHR = 220 - age;

    const intensityMultipliers = {
      [ExerciseType.Walking]: 0.5,
      [ExerciseType.Running]: 0.8,
      [ExerciseType.Cycling]: 0.7,
      [ExerciseType.Swimming]: 0.7,
      [ExerciseType.Strength]: 0.6,
      [ExerciseType.HIIT]: 0.85,
      [ExerciseType.Yoga]: 0.4,
      [ExerciseType.Other]: 0.6,
    };

    const exerciseIntensity = intensityMultipliers[exerciseType];
    return Math.max(
      60,
      Math.min(220, Math.round(maxHR * exerciseIntensity * intensity)),
    );
  }

  static calculateEstimateKM(
    duration: number,
    exerciseType: ExerciseType,
    user: User,
  ): number {
    if (!duration || duration < 0) return 0;

    // Average speed in km/h for different exercise types
    const speedByExerciseType = {
      [ExerciseType.Walking]: 5.0, // 5 km/h average walking speed
      [ExerciseType.Running]: 9.0, // 9 km/h average jogging/running speed
      [ExerciseType.Cycling]: 15.0, // 15 km/h average cycling speed
      [ExerciseType.Swimming]: 2.0, // 2 km/h average swimming speed
      [ExerciseType.Strength]: 0.0, // Stationary exercise
      [ExerciseType.HIIT]: 1.0, // Minimal distance covered
      [ExerciseType.Yoga]: 0.0, // Stationary exercise
      [ExerciseType.Other]: 3.0, // Default moderate movement
    };

    // Calculate distance in km based on duration (minutes) and speed (km/h)
    const distanceKM = (duration / 60) * speedByExerciseType[exerciseType];

    // Round to 2 decimal places and ensure non-negative
    return Math.max(0, Math.round(distanceKM * 100) / 100);
  }
}
