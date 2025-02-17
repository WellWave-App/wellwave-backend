import { RiskAssessmentEntity } from '@/.typeorm/entities/assessment.entity';
import {
  Habits,
  HabitCategories,
  ExerciseType,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import {
  UserHabits,
  HabitStatus,
} from '@/.typeorm/entities/user-habits.entity';
import { User, USER_GOAL } from '@/.typeorm/entities/users.entity';
import { RiskCalculator, RiskLevel } from '../utils/risk-calculator.util';

// HabitRecommendService
export class HabitRecommendService {
  // Weights for different recommendation approaches
  private static readonly WEIGHTS = {
    collaborative: 0.3,
    contentBased: 0.3,
    ruleBased: 0.2,
    popularityBased: 0.2,
  };

  // Content-based filtering
  private static calculateContentBasedScore(
    habit: Habits,
    user: User,
    userHabits: UserHabits[],
  ): number {
    try {
      // Handle case where habit is null or undefined
      if (!habit) return 0;

      // Extract features for the current habit
      const habitFeatures = this.extractHabitFeatures(habit);
      if (!habitFeatures) return 0;

      // Create user profile
      const userProfile = this.createUserProfile(userHabits);

      // Calculate similarity
      const similarity = this.cosineSimilarity(habitFeatures, userProfile);

      // Return valid similarity or default score
      return isNaN(similarity) ? 0.5 : similarity;
    } catch (error) {
      console.error('Error calculating content-based score:', error);
      return 0.5; // Return neutral score on error
    }
  }

  private static extractHabitFeatures(habit: Habits): number[] {
    if (!habit) return null;

    try {
      const features = [
        // Category encoding
        habit.CATEGORY === HabitCategories.Exercise ? 1 : 0,
        habit.CATEGORY === HabitCategories.Diet ? 1 : 0,
        habit.CATEGORY === HabitCategories.Sleep ? 1 : 0,

        // Exercise type encoding
        ...Object.values(ExerciseType).map((type) =>
          habit.EXERCISE_TYPE === type ? 1 : 0,
        ),

        // Tracking type encoding
        ...Object.values(TrackingType).map((type) =>
          habit.TRACKING_TYPE === type ? 1 : 0,
        ),

        // Normalized reward values
        habit.EXP_REWARD ? habit.EXP_REWARD / 100 : 0,
        habit.GEM_REWARD ? habit.GEM_REWARD / 100 : 0,

        // Goal-related features
        habit.DEFAULT_DAILY_MINUTE_GOAL
          ? habit.DEFAULT_DAILY_MINUTE_GOAL / 60
          : 0,
        habit.IS_DAILY ? 1 : 0,
      ];

      return features;
    } catch (error) {
      console.error('Error extracting habit features:', error);
      return null;
    }
  }

  // private static createUserProfile(userHabits: UserHabits[]): number[] {
  //   // Average feature vectors of user's successful habits
  //   if (userHabits.length === 0) return new Array(12).fill(0);

  //   const successfulHabits = userHabits.filter(
  //     (uh) => uh.STATUS === HabitStatus.Completed,
  //   );

  //   const featureVectors = successfulHabits.map((uh) =>
  //     this.extractHabitFeatures(uh.habits),
  //   );

  //   return featureVectors
  //     .reduce((acc, vector) => acc.map((val, idx) => val + vector[idx]))
  //     .map((sum) => sum / featureVectors.length);
  // }
  private static createUserProfile(userHabits: UserHabits[]): number[] {
    // Initialize default feature vector with zeros
    const defaultProfile = new Array(12).fill(0);

    // If no habits, return default profile
    if (!userHabits || userHabits.length === 0) {
      return defaultProfile;
    }

    const successfulHabits = userHabits.filter(
      (uh) => uh.STATUS === HabitStatus.Completed && uh.habits, // Make sure habits exists
    );

    // If no successful habits, return default profile
    if (successfulHabits.length === 0) {
      return defaultProfile;
    }

    // Create feature vectors
    const featureVectors = successfulHabits
      .map((uh) => this.extractHabitFeatures(uh.habits))
      .filter((vector) => vector != null); // Filter out any null vectors

    // If no valid feature vectors, return default profile
    if (featureVectors.length === 0) {
      return defaultProfile;
    }

    // Calculate average feature vector
    const sumVector = featureVectors.reduce(
      (acc, vector) => acc.map((val, idx) => val + vector[idx]),
      new Array(featureVectors[0].length).fill(0),
    );

    return sumVector.map((sum) => sum / featureVectors.length);
  }

  // Collaborative filtering
  private static calculateCollaborativeScore(
    habit: Habits,
    user: User,
    allUsers: User[],
  ): number {
    // Find similar users
    const similarUsers = this.findSimilarUsers(user, allUsers);

    // Calculate habit success rate among similar users
    return this.calculateHabitSuccessRate(habit, similarUsers);
  }

  private static findSimilarUsers(user: User, allUsers: User[]): User[] {
    return allUsers
      .filter((otherUser) => otherUser.UID !== user.UID)
      .map((otherUser) => ({
        user: otherUser,
        similarity: this.calculateUserSimilarity(user, otherUser),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 10)
      .map((result) => result.user);
  }

  private static calculateUserSimilarity(user1: User, user2: User): number {
    let similarity = 0;

    // Age similarity
    const ageDiff = Math.abs(
      (user1.YEAR_OF_BIRTH || 0) - (user2.YEAR_OF_BIRTH || 0),
    );
    similarity += (1 - Math.min(ageDiff / 50, 1)) * 0.2;

    // Goal similarity
    similarity += user1.USER_GOAL === user2.USER_GOAL ? 0.3 : 0;

    // Risk profile similarity
    const risk1 = user1.RiskAssessment;
    const risk2 = user2.RiskAssessment;
    if (risk1 && risk2) {
      const riskSimilarity = this.calculateRiskSimilarity(risk1, risk2);
      similarity += riskSimilarity * 0.5;
    }

    return similarity;
  }

  private static calculateRiskSimilarity(
    risk1: RiskAssessmentEntity,
    risk2: RiskAssessmentEntity,
  ): number {
    const factors = [
      'DIABETES',
      'HYPERTENSION',
      'DYSLIPIDEMIA',
      'OBESITY',
    ] as const;

    return factors.reduce((sim, factor) => {
      const diff = Math.abs((risk1[factor] || 0) - (risk2[factor] || 0));
      return sim + (1 - Math.min(diff / 5, 1)) / factors.length;
    }, 0);
  }

  private static calculateHabitSuccessRate(
    habit: Habits,
    similarUsers: User[],
  ): number {
    const habitAttempts = similarUsers.flatMap((user) =>
      user.habits.filter((h) => h.HID === habit.HID),
    );

    if (habitAttempts.length === 0) return 0.5; // Neutral score if no data

    const successfulAttempts = habitAttempts.filter(
      (h) => h.STATUS === HabitStatus.Completed,
    );

    return successfulAttempts.length / habitAttempts.length;
  }

  // Popularity-based scoring
  private static calculatePopularityScore(
    habit: Habits,
    allUsers: User[],
  ): number {
    const totalAdoptions = allUsers.reduce(
      (count, user) =>
        count + user.habits.filter((h) => h.HID === habit.HID).length,
      0,
    );

    // Normalize by total user count with a dampening factor
    return Math.log(1 + totalAdoptions) / Math.log(1 + allUsers.length);
  }

  // Maps exercise types to their intensity levels (0-1)
  private static readonly EXERCISE_INTENSITY: Record<ExerciseType, number> = {
    [ExerciseType.Walking]: 0.3,
    [ExerciseType.Running]: 0.8,
    [ExerciseType.Cycling]: 0.6,
    [ExerciseType.Swimming]: 0.7,
    [ExerciseType.Strength]: 0.7,
    [ExerciseType.HIIT]: 0.9,
    [ExerciseType.Yoga]: 0.4,
    [ExerciseType.Other]: 0.5,
  };

  // Calculate habit score based on user's risk assessment
  private static calculateRiskScore(
    habit: Habits,
    riskAssessment: RiskAssessmentEntity,
  ): number {
    let score = 0;
    const riskLevel = RiskCalculator.calculateOverallRiskLevel({
      diabetes: riskAssessment.DIABETES ?? 0,
      hypertension: riskAssessment.HYPERTENSION ?? 0,
      dyslipidemia: riskAssessment.DYSLIPIDEMIA ?? 0,
      obesity: riskAssessment.OBESITY ?? 0,
    });

    // Recommend more intensive exercise for higher risk levels
    if (habit.CATEGORY === HabitCategories.Exercise) {
      const intensity = this.EXERCISE_INTENSITY[habit.EXERCISE_TYPE];
      switch (riskLevel) {
        case RiskLevel.VERY_HIGH:
          score += intensity * 0.5; // Prefer moderate intensity for very high risk
          break;
        case RiskLevel.HIGH:
          score += intensity * 0.7;
          break;
        case RiskLevel.MODERATE:
          score += intensity * 0.9;
          break;
        case RiskLevel.LOW:
          score += intensity;
          break;
      }
    }

    // Diet habits are important for all risk levels
    if (habit.CATEGORY === HabitCategories.Diet) {
      score += riskLevel === RiskLevel.LOW ? 0.5 : 1.0;
    }

    // Sleep habits are important for all risk levels
    if (habit.CATEGORY === HabitCategories.Sleep) {
      score += riskLevel === RiskLevel.LOW ? 0.7 : 0.9;
    }

    return score;
  }

  // Calculate habit score based on user's goals
  private static calculateGoalScore(
    habit: Habits,
    userGoal: USER_GOAL,
  ): number {
    let score = 0;

    switch (userGoal) {
      case USER_GOAL.BUILD_MUSCLE:
        if (habit.CATEGORY === HabitCategories.Exercise) {
          score += habit.EXERCISE_TYPE === ExerciseType.Strength ? 1.0 : 0.4;
        }
        if (habit.CATEGORY === HabitCategories.Diet) {
          score += 0.8; // Diet is important for muscle building
        }
        break;

      case USER_GOAL.LOSE_WEIGHT:
        if (habit.CATEGORY === HabitCategories.Exercise) {
          score += this.EXERCISE_INTENSITY[habit.EXERCISE_TYPE];
        }
        if (habit.CATEGORY === HabitCategories.Diet) {
          score += 1.0; // Diet is crucial for weight loss
        }
        break;

      case USER_GOAL.STAY_HEALTHY:
        // Balanced approach for general health
        score += 0.7;
        break;
    }

    return score;
  }

  // Calculate habit score based on user's current habits
  private static calculateCurrentHabitsScore(
    habit: Habits,
    currentHabits: UserHabits[],
  ): number {
    let score = 1.0; // Start with max score

    // Check if user already has similar habits
    const similarHabits = currentHabits.filter(
      (h) => h.habits.CATEGORY === habit.CATEGORY,
    );

    if (similarHabits.length > 0) {
      // Reduce score if user already has habits in this category
      score *= 0.5;

      // Further reduce score if user has the exact same exercise type
      if (
        habit.CATEGORY === HabitCategories.Exercise &&
        similarHabits.some(
          (h) => h.habits.EXERCISE_TYPE === habit.EXERCISE_TYPE,
        )
      ) {
        score *= 0.3;
      }
    }

    // Boost score for habits that complement existing ones
    if (
      habit.CATEGORY === HabitCategories.Diet &&
      currentHabits.some((h) => h.habits.CATEGORY === HabitCategories.Exercise)
    ) {
      score *= 1.2;
    }

    return score;
  }

  // Rule-based scoring combines all above scores
  private static calculateRuleBasedScore(habit: Habits, user: User): number {
    const riskScore = this.calculateRiskScore(habit, user.RiskAssessment);
    const goalScore = this.calculateGoalScore(habit, user.USER_GOAL);
    const currentHabitsScore = this.calculateCurrentHabitsScore(
      habit,
      user.habits,
    );

    return (riskScore + goalScore + currentHabitsScore) / 3;
  }

  // Utility functions
  private static cosineSimilarity(vec1: number[], vec2: number[]): number {
    try {
      if (!vec1 || !vec2 || vec1.length !== vec2.length) {
        return 0;
      }

      const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
      const magnitude1 = Math.sqrt(
        vec1.reduce((sum, val) => sum + val * val, 0),
      );
      const magnitude2 = Math.sqrt(
        vec2.reduce((sum, val) => sum + val * val, 0),
      );

      if (magnitude1 === 0 || magnitude2 === 0) return 0;

      return dotProduct / (magnitude1 * magnitude2);
    } catch (error) {
      console.error('Error calculating cosine similarity:', error);
      return 0;
    }
  }

  // Main recommendation function
  static async recommendHabits(
    availableHabits: Habits[],
    user: User,
    allUsers: User[],
    maxRecommendations: number = 5,
  ): Promise<
    {
      habit: Habits;
      scoreInfo: { score: number; scores: { [key: string]: number } };
    }[]
  > {
    try {
      // Handle empty inputs
      if (!availableHabits || availableHabits.length === 0) {
        return [];
      }

      if (!user || !allUsers || allUsers.length === 0) {
        // Fall back to simple rule-based scoring if no collaborative data
        return this.fallbackRecommendations(
          availableHabits,
          user,
          maxRecommendations,
        );
      }

      const scoredHabits = await Promise.all(
        availableHabits.map(async (habit) => {
          try {
            // Calculate individual scores with error handling
            const contentScore = this.calculateContentBasedScore(
              habit,
              user,
              user.habits || [],
            );
            const collaborativeScore = this.calculateCollaborativeScore(
              habit,
              user,
              allUsers,
            );
            const ruleScore = this.calculateRuleBasedScore(habit, user);
            const popularityScore = this.calculatePopularityScore(
              habit,
              allUsers,
            );

            // Calculate weighted total score
            const totalScore =
              contentScore * this.WEIGHTS.contentBased +
              collaborativeScore * this.WEIGHTS.collaborative +
              ruleScore * this.WEIGHTS.ruleBased +
              popularityScore * this.WEIGHTS.popularityBased;

            return {
              habit,
              scoreInfo: {
                score: totalScore,
                scores: {
                  contentBased: contentScore,
                  collaborative: collaborativeScore,
                  ruleBased: ruleScore,
                  popularity: popularityScore,
                },
              },
            };
          } catch (error) {
            console.error('Error scoring habit:', error);
            return {
              habit,
              scoreInfo: {
                score: 0,
                scores: {
                  contentBased: 0,
                  collaborative: 0,
                  ruleBased: 0,
                  popularity: 0,
                },
              },
            };
          }
        }),
      );

      // Sort by total score and return top recommendations
      return scoredHabits
        .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score)
        .slice(0, maxRecommendations);
      // .map((scored) => scored);
    } catch (error) {
      console.error('Error in recommendHabits:', error);
      return this.fallbackRecommendations(
        availableHabits,
        user,
        maxRecommendations,
      );
    }
  }

  private static fallbackRecommendations(
    availableHabits: Habits[],
    user: User,
    maxRecommendations: number,
  ): {
    habit: Habits;
    scoreInfo: { score: number; scores: { [key: string]: number } };
  }[] {
    try {
      const scoredHabits = availableHabits.map((habit) => ({
        habit,
        scoreInfo: {
          score: this.calculateRuleBasedScore(habit, user),
          scores: {
            ruleBased: this.calculateRuleBasedScore(habit, user),
            contentBased: 0,
            collaborative: 0,
            popularity: 0,
          },
        },
      }));

      return scoredHabits
        .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score)
        .slice(0, maxRecommendations);
    } catch (error) {
      console.error('Error in fallback recommendations:', error);
      return availableHabits.slice(0, maxRecommendations).map((habit) => ({
        habit,
        scoreInfo: {
          score: 0,
          scores: {
            ruleBased: 0,
            contentBased: 0,
            collaborative: 0,
            popularity: 0,
          },
        },
      }));
    }
  }
}
