// import {
//   ExerciseType,
//   HabitCategories,
// } from '@/.typeorm/entities/habit.entity';
// import { testUsers, testHabits } from './rec-habits';
// import { HabitRecommendService } from '../habits-recommendation.service';

// describe('HabitRecommendService', () => {
//   // Helper to get a clean copy of test data
//   const getTestUser = (id: number) => {
//     return JSON.parse(JSON.stringify(testUsers.find((u) => u.UID === id)));
//   };

//   describe('Content-Based Filtering', () => {
//     it('should calculate appropriate content-based scores', () => {
//       const user = getTestUser(1); // John - muscle building focus
//       const contentScore = HabitRecommendService['calculateContentBasedScore'](
//         testHabits.find((h) => h.HID === 2), // Strength Training
//         user,
//         user.habits,
//       );

//       expect(contentScore).toBeGreaterThan(0.5);
//     });

//     it('should prefer strength training for muscle building goal', () => {
//       const user = getTestUser(1); // John - muscle building
//       const strengthHabit = testHabits.find(
//         (h) => h.EXERCISE_TYPE === ExerciseType.Strength,
//       );
//       const walkingHabit = testHabits.find(
//         (h) => h.EXERCISE_TYPE === ExerciseType.Walking,
//       );

//       const strengthScore = HabitRecommendService['calculateContentBasedScore'](
//         strengthHabit,
//         user,
//         user.habits,
//       );
//       const walkingScore = HabitRecommendService['calculateContentBasedScore'](
//         walkingHabit,
//         user,
//         user.habits,
//       );

//       expect(strengthScore).toBeGreaterThan(walkingScore);
//     });
//   });

//   describe('Collaborative Filtering', () => {
//     it('should find similar users correctly', () => {
//       const user = getTestUser(1); // John
//       const similarUsers = HabitRecommendService['findSimilarUsers'](
//         user,
//         testUsers,
//       );

//       // Sarah should be most similar to John (both young, muscle building)
//       expect(similarUsers[0].UID).toBe(5); // Sarah's UID
//     });

//     it('should calculate user similarity appropriately', () => {
//       const user1 = getTestUser(1); // John
//       const user2 = getTestUser(5); // Sarah - similar goals and age
//       const user3 = getTestUser(4); // Robert - very different

//       const similarity12 = HabitRecommendService['calculateUserSimilarity'](
//         user1,
//         user2,
//       );
//       const similarity13 = HabitRecommendService['calculateUserSimilarity'](
//         user1,
//         user3,
//       );

//       expect(similarity12).toBeGreaterThan(similarity13);
//     });
//   });

//   describe('Rule-Based Scoring', () => {
//     it('should calculate risk scores appropriately', () => {
//       const lowRiskUser = getTestUser(5); // Sarah
//       const highRiskUser = getTestUser(2); // Mary
//       const exerciseHabit = testHabits.find(
//         (h) => h.CATEGORY === HabitCategories.Exercise,
//       );

//       const lowRiskScore = HabitRecommendService['calculateRiskScore'](
//         exerciseHabit,
//         lowRiskUser.RiskAssessment,
//       );
//       const highRiskScore = HabitRecommendService['calculateRiskScore'](
//         exerciseHabit,
//         highRiskUser.RiskAssessment,
//       );

//       expect(highRiskScore).not.toEqual(lowRiskScore);
//     });

//     it('should calculate goal scores correctly', () => {
//       const muscleUser = getTestUser(1); // John
//       const weightLossUser = getTestUser(2); // Mary
//       const strengthHabit = testHabits.find(
//         (h) => h.EXERCISE_TYPE === ExerciseType.Strength,
//       );

//       const muscleScore = HabitRecommendService['calculateGoalScore'](
//         strengthHabit,
//         muscleUser.USER_GOAL,
//       );
//       const weightLossScore = HabitRecommendService['calculateGoalScore'](
//         strengthHabit,
//         weightLossUser.USER_GOAL,
//       );

//       expect(muscleScore).toBeGreaterThan(weightLossScore);
//     });
//   });

//   // describe('Popularity-Based Scoring', () => {
//   //   it('should calculate popularity scores', () => {
//   //     // Add some history to users
//   //     const usersWithHistory = testUsers.map((user) => ({
//   //       ...user,
//   //       habits: [
//   //         { HID: 1, STATUS: 'completed' },
//   //         { HID: 2, STATUS: 'active' },
//   //       ],
//   //     }));

//   //     const popularityScore = HabitRecommendService[
//   //       'calculatePopularityScore'
//   //     ](testHabits[0], usersWithHistory);

//   //     expect(popularityScore).toBeGreaterThan(0);
//   //   });
//   // });

//   describe('Overall Recommendations', () => {
//     it('should return the requested number of recommendations', async () => {
//       const user = getTestUser(1);
//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         user,
//         testUsers,
//         3,
//       );

//       expect(recommendations).toHaveLength(3);
//     });

//     it('should handle empty habits list', async () => {
//       const user = getTestUser(1);
//       const recommendations = await HabitRecommendService.recommendHabits(
//         [],
//         user,
//         testUsers,
//         3,
//       );

//       expect(recommendations).toHaveLength(0);
//     });

//     it('should recommend appropriate habits for high-risk users', async () => {
//       const highRiskUser = getTestUser(2); // Mary
//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         highRiskUser,
//         testUsers,
//         5,
//       );

//       // Should include walking and diet habits
//       const hasWalking = recommendations.some(
//         (h) => h.EXERCISE_TYPE === ExerciseType.Walking,
//       );
//       const hasDiet = recommendations.some(
//         (h) => h.CATEGORY === HabitCategories.Diet,
//       );

//       expect(hasWalking || hasDiet).toBeTruthy();
//     });

//     it('should recommend strength training for muscle building goal', async () => {
//       const muscleUser = getTestUser(1); // John
//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         muscleUser,
//         testUsers,
//         5,
//       );

//       const hasStrength = recommendations.some(
//         (h) => h.EXERCISE_TYPE === ExerciseType.Strength,
//       );
//       const hasProteinDiet = recommendations.some((h) =>
//         h.TITLE.includes('Protein'),
//       );

//       expect(hasStrength && hasProteinDiet).toBeTruthy();
//     });

//     it('should handle users with no risk assessment', async () => {
//       const user = getTestUser(1);
//       user.RiskAssessment = null;

//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         user,
//         testUsers,
//         3,
//       );

//       expect(recommendations).toHaveLength(3);
//     });

//     it('should not recommend duplicate habits', async () => {
//       const user = getTestUser(1);
//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         user,
//         testUsers,
//         5,
//       );

//       const uniqueHabitIds = new Set(recommendations.map((h) => h.HID));
//       expect(uniqueHabitIds.size).toBe(recommendations.length);
//     });
//   });

//   describe('Edge Cases', () => {
//     it('should handle undefined user goals', async () => {
//       const user = getTestUser(1);
//       user.USER_GOAL = undefined;

//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         user,
//         testUsers,
//         3,
//       );

//       expect(recommendations).toHaveLength(3);
//     });

//     it('should handle users with no similar users', async () => {
//       const user = getTestUser(1);
//       const recommendations = await HabitRecommendService.recommendHabits(
//         testHabits,
//         user,
//         [user], // Only the user themselves in the users list
//         3,
//       );

//       expect(recommendations).toHaveLength(3);
//     });

//     it('should handle invalid exercise types', () => {
//       const user = getTestUser(1);
//       const invalidHabit = {
//         ...testHabits[0],
//         EXERCISE_TYPE: 'invalid' as ExerciseType,
//       };

//       expect(() => {
//         HabitRecommendService['calculateRuleBasedScore'](invalidHabit, user);
//       }).not.toThrow();
//     });
//   });
// });
