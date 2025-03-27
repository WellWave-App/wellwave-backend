// import { DailyHabitTrack } from "@/.typeorm/entities/daily-habit-track.entity";
// import { Habits, HabitCategories, ExerciseType, TrackingType } from "@/.typeorm/entities/habit.entity";
// import { UserHabits, HabitStatus } from "@/.typeorm/entities/user-habits.entity";
// import { UserQuests } from "@/.typeorm/entities/user-quests.entity";
// import { User } from "@/.typeorm/entities/users.entity";
// import { DateService } from "@/helpers/date/date.services";
// import { ImageService } from "@/image/image.service";
// import { QuestService } from "@/mission/quest/services/quest.service";
// import { LogsService } from "@/user-logs/services/logs.service";
// import { UsersService } from "@/users/services/users.service";
// import { TestingModule, Test } from "@nestjs/testing";
// import { getRepositoryToken } from "@nestjs/typeorm";
// import { Repository } from "typeorm";
// import { TrackHabitDto } from "../dto/track-habit.dto";
// import { HabitService } from "../services/habit.service";


// describe('HabitService', () => {
//   let service: HabitService;
//   let habitsRepository: Repository<Habits>;
//   let userHabitsRepository: Repository<UserHabits>;
//   let dailyTrackRepository: Repository<DailyHabitTrack>;
//   let userRepository: Repository<User>;
//   let userQuestRepository: Repository<UserQuests>;
//   let questService: QuestService;
//   let logService: LogsService;
//   let userService: UsersService;
//   let dateService: DateService;

//   const mockImageService = {
//     getImageUrl: jest.fn(
//       (filename) => `https://example.com/images/${filename}`,
//     ),
//     deleteImageByUrl: jest.fn(),
//   };

//   const mockQuestService = {
//     updateQuestProgress: jest.fn(),
//   };

//   const mockLogsService = {
//     create: jest.fn(),
//   };

//   const mockUsersService = {
//     getById: jest.fn(),
//   };

//   const mockDateService = {
//     getCurrentDate: jest.fn(() => ({ date: new Date().toISOString() })),
//     isSameDay: jest.fn((date1, date2) => {
//       const d1 = new Date(date1);
//       const d2 = new Date(date2);
//       return (
//         d1.getFullYear() === d2.getFullYear() &&
//         d1.getMonth() === d2.getMonth() &&
//         d1.getDate() === d2.getDate()
//       );
//     }),
//     getStartOfDay: jest.fn((date) => {
//       const d = new Date(date);
//       d.setHours(0, 0, 0, 0);
//       return d;
//     }),
//     getEndOfDay: jest.fn((date) => {
//       const d = new Date(date);
//       d.setHours(23, 59, 59, 999);
//       return d;
//     }),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         HabitService,
//         {
//           provide: getRepositoryToken(Habits),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(UserHabits),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(DailyHabitTrack),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(User),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(UserQuests),
//           useClass: Repository,
//         },
//         {
//           provide: ImageService,
//           useValue: mockImageService,
//         },
//         {
//           provide: QuestService,
//           useValue: mockQuestService,
//         },
//         {
//           provide: LogsService,
//           useValue: mockLogsService,
//         },
//         {
//           provide: UsersService,
//           useValue: mockUsersService,
//         },
//         {
//           provide: DateService,
//           useValue: mockDateService,
//         },
//       ],
//     }).compile();

//     service = module.get<HabitService>(HabitService);
//     habitsRepository = module.get<Repository<Habits>>(
//       getRepositoryToken(Habits),
//     );
//     userHabitsRepository = module.get<Repository<UserHabits>>(
//       getRepositoryToken(UserHabits),
//     );
//     dailyTrackRepository = module.get<Repository<DailyHabitTrack>>(
//       getRepositoryToken(DailyHabitTrack),
//     );
//     userRepository = module.get<Repository<User>>(getRepositoryToken(User));
//     userQuestRepository = module.get<Repository<UserQuests>>(
//       getRepositoryToken(UserQuests),
//     );
//     questService = module.get<QuestService>(QuestService);
//     logService = module.get<LogsService>(LogsService);
//     userService = module.get<UsersService>(UsersService);
//     dateService = module.get<DateService>(DateService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('trackHabit', () => {
//     it('should track a duration-based habit and update related quests', async () => {
//       const userId = 1;
//       const challengeId = 10;
//       const trackDto: TrackHabitDto = {
//         CHALLENGE_ID: challengeId,
//         DURATION_MINUTES: 30,
//       };

//       const habit = {
//         HID: 1,
//         TITLE: 'Exercise',
//         CATEGORY: HabitCategories.Exercise,
//         EXERCISE_TYPE: ExerciseType.Running,
//         TRACKING_TYPE: TrackingType.Duration,
//       } as Habits;

//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         HID: habit.HID,
//         STATUS: HabitStatus.Active,
//         DAILY_MINUTE_GOAL: 20,
//         END_DATE: new Date('2100-01-01'), // Future date
//         habits: habit,
//       } as UserHabits;

//       const dailyTrack = {
//         TRACK_ID: 1,
//         CHALLENGE_ID: challengeId,
//         TRACK_DATE: new Date(),
//         DURATION_MINUTES: 30,
//         COMPLETED: true,
//         calculateMetrics: jest.fn(),
//       } as unknown as DailyHabitTrack;

//       const mockUser = { UID: userId } as User;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(null);
//       jest.spyOn(dailyTrackRepository, 'create').mockReturnValue(dailyTrack);
//       jest.spyOn(dailyTrackRepository, 'save').mockResolvedValue(dailyTrack);
//       jest.spyOn(userService, 'getById').mockResolvedValue(mockUser);

//       // Mock required methods to prevent actual execution
//       jest
//         .spyOn(service as any, 'updateRelatedLogs')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'updateStreakCount')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'checkChallengeCompletion')
//         .mockResolvedValue(undefined);

//       // Execute the method
//       const result = await service.trackHabit(userId, trackDto);

//       // Verify results
//       expect(result).toEqual(dailyTrack);
//       expect(result.DURATION_MINUTES).toEqual(30);
//       expect(result.COMPLETED).toBe(true);

//       // Verify quest service was called
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           category: HabitCategories.Exercise,
//           exerciseType: ExerciseType.Running,
//           trackingType: TrackingType.Duration,
//           value: 30,
//         }),
//       );

//       // Verify streak and completion checks
//       expect(service['updateStreakCount']).toHaveBeenCalledWith(challengeId);
//       expect(service['checkChallengeCompletion']).toHaveBeenCalledWith(
//         challengeId,
//       );
//     });

//     it('should track a boolean-based habit and update related quests', async () => {
//       const userId = 1;
//       const challengeId = 10;
//       const trackDto: TrackHabitDto = {
//         CHALLENGE_ID: challengeId,
//         COMPLETED: true,
//       };

//       const habit = {
//         HID: 2,
//         TITLE: 'Sleep Well',
//         CATEGORY: HabitCategories.Sleep,
//         TRACKING_TYPE: TrackingType.Boolean,
//       } as Habits;

//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         HID: habit.HID,
//         STATUS: HabitStatus.Active,
//         END_DATE: new Date('2100-01-01'), // Future date
//         habits: habit,
//       } as UserHabits;

//       const dailyTrack = {
//         TRACK_ID: 2,
//         CHALLENGE_ID: challengeId,
//         TRACK_DATE: new Date(),
//         COMPLETED: true,
//       } as DailyHabitTrack;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(null);
//       jest.spyOn(dailyTrackRepository, 'create').mockReturnValue(dailyTrack);
//       jest.spyOn(dailyTrackRepository, 'save').mockResolvedValue(dailyTrack);

//       // Mock required methods to prevent actual execution
//       jest
//         .spyOn(service as any, 'updateRelatedLogs')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'updateStreakCount')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'checkChallengeCompletion')
//         .mockResolvedValue(undefined);

//       // Execute the method
//       const result = await service.trackHabit(userId, trackDto);

//       // Verify results
//       expect(result).toEqual(dailyTrack);
//       expect(result.COMPLETED).toBe(true);

//       // Verify quest service was called
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           category: HabitCategories.Sleep,
//           trackingType: TrackingType.Boolean,
//           value: 1, // Boolean completion is 1
//         }),
//       );
//     });

//     it('should track a distance-based habit and update related quests', async () => {
//       const userId = 1;
//       const challengeId = 10;
//       const trackDto: TrackHabitDto = {
//         CHALLENGE_ID: challengeId,
//         DISTANCE_KM: 5.5,
//       };

//       const habit = {
//         HID: 3,
//         TITLE: 'Running',
//         CATEGORY: HabitCategories.Exercise,
//         EXERCISE_TYPE: ExerciseType.Running,
//         TRACKING_TYPE: TrackingType.Distance,
//       } as Habits;

//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         HID: habit.HID,
//         STATUS: HabitStatus.Active,
//         END_DATE: new Date('2100-01-01'), // Future date
//         habits: habit,
//       } as UserHabits;

//       const dailyTrack = {
//         TRACK_ID: 3,
//         CHALLENGE_ID: challengeId,
//         TRACK_DATE: new Date(),
//         DISTANCE_KM: 5.5,
//         COMPLETED: true,
//       } as DailyHabitTrack;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(null);
//       jest.spyOn(dailyTrackRepository, 'create').mockReturnValue(dailyTrack);
//       jest.spyOn(dailyTrackRepository, 'save').mockResolvedValue(dailyTrack);

//       // Mock required methods to prevent actual execution
//       jest
//         .spyOn(service as any, 'updateRelatedLogs')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'updateStreakCount')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'checkChallengeCompletion')
//         .mockResolvedValue(undefined);

//       // Execute the method
//       const result = await service.trackHabit(userId, trackDto);

//       // Verify results
//       expect(result).toEqual(dailyTrack);
//       expect(result.DISTANCE_KM).toEqual(5.5);
//       expect(result.COMPLETED).toBe(true);

//       // Verify quest service was called
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           category: HabitCategories.Exercise,
//           exerciseType: ExerciseType.Running,
//           trackingType: TrackingType.Distance,
//           value: 5.5,
//         }),
//       );
//     });

//     it('should handle updating existing daily tracks', async () => {
//       const userId = 1;
//       const challengeId = 10;
//       const trackDto: TrackHabitDto = {
//         CHALLENGE_ID: challengeId,
//         DURATION_MINUTES: 45, // Updated duration
//       };

//       const habit = {
//         HID: 1,
//         TITLE: 'Exercise',
//         CATEGORY: HabitCategories.Exercise,
//         EXERCISE_TYPE: ExerciseType.Running,
//         TRACKING_TYPE: TrackingType.Duration,
//       } as Habits;

//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         HID: habit.HID,
//         STATUS: HabitStatus.Active,
//         DAILY_MINUTE_GOAL: 20,
//         END_DATE: new Date('2100-01-01'), // Future date
//         habits: habit,
//       } as UserHabits;

//       const existingDailyTrack = {
//         TRACK_ID: 1,
//         CHALLENGE_ID: challengeId,
//         TRACK_DATE: new Date(),
//         DURATION_MINUTES: 20, // Original duration
//         COMPLETED: true,
//         calculateMetrics: jest.fn(),
//       } as unknown as DailyHabitTrack;

//       const updatedDailyTrack = {
//         ...existingDailyTrack,
//         DURATION_MINUTES: 45, // Updated duration
//       } as unknown as DailyHabitTrack;

//       const mockUser = { UID: userId } as User;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(dailyTrackRepository, 'findOne')
//         .mockResolvedValue(existingDailyTrack);
//       jest
//         .spyOn(dailyTrackRepository, 'save')
//         .mockResolvedValue(updatedDailyTrack);
//       jest.spyOn(userService, 'getById').mockResolvedValue(mockUser);

//       // Mock required methods to prevent actual execution
//       jest
//         .spyOn(service as any, 'updateRelatedLogs')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'updateStreakCount')
//         .mockResolvedValue(undefined);
//       jest
//         .spyOn(service as any, 'checkChallengeCompletion')
//         .mockResolvedValue(undefined);

//       // Execute the method
//       const result = await service.trackHabit(userId, trackDto);

//       // Verify results
//       expect(result).toEqual(updatedDailyTrack);
//       expect(result.DURATION_MINUTES).toEqual(45);

//       // Verify quest service was called with the updated value
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 45,
//         }),
//       );
//     });

//     it('should throw an error when tracking a non-active challenge', async () => {
//       const userId = 1;
//       const challengeId = 10;
//       const trackDto: TrackHabitDto = {
//         CHALLENGE_ID: challengeId,
//         DURATION_MINUTES: 30,
//       };

//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STATUS: HabitStatus.Completed, // Already completed
//         habits: {
//           TRACKING_TYPE: TrackingType.Duration,
//         },
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);

//       await expect(service.trackHabit(userId, trackDto)).rejects.toThrow(
//         'Challenge is not active',
//       );
//     });
//   });

//   describe('updateStreakCount', () => {
//     it('should update streak count and notify quest service when streak increases', async () => {
//       const challengeId = 10;
//       const userId = 1;

//       // Create userHabit with sorted dailyTracks (most recent first)
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STREAK_COUNT: 2, // Current streak before update
//         habits: {
//           CATEGORY: HabitCategories.Exercise,
//           EXERCISE_TYPE: ExerciseType.Running,
//         },
//         dailyTracks: [
//           {
//             TRACK_DATE: new Date('2023-01-03'), // Today
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2023-01-02'), // Yesterday
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2023-01-01'), // 2 days ago
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2022-12-31'), // 3 days ago
//             COMPLETED: false, // Streak break
//           },
//         ],
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(userHabitsRepository, 'save')
//         .mockImplementation(async (entity) => entity as UserHabits);

//       // Execute the private method
//       await (service as any).updateStreakCount(challengeId);

//       // Verify streak was updated
//       expect(userHabit.STREAK_COUNT).toEqual(3); // New streak value
//       expect(userHabitsRepository.save).toHaveBeenCalledWith(userHabit);

//       // Verify quest service was called with the updated streak
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           category: HabitCategories.Exercise,
//           exerciseType: ExerciseType.Running,
//           trackingType: TrackingType.Count,
//           value: 3, // Updated streak
//           progressType: 'streak',
//         }),
//       );
//     });

//     it('should not notify quest service when streak does not increase', async () => {
//       const challengeId = 10;
//       const userId = 1;

//       // Create userHabit where the streak hasn't increased
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STREAK_COUNT: 3, // Current streak
//         habits: {
//           CATEGORY: HabitCategories.Exercise,
//         },
//         dailyTracks: [
//           {
//             TRACK_DATE: new Date('2023-01-03'), // Today
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2023-01-02'), // Yesterday
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2023-01-01'), // 2 days ago
//             COMPLETED: true,
//           },
//         ],
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(userHabitsRepository, 'save')
//         .mockImplementation(async (entity) => entity as UserHabits);

//       // Reset mock to check if it gets called
//       jest.clearAllMocks();

//       // Execute the private method
//       await (service as any).updateStreakCount(challengeId);

//       // Verify streak is still the same
//       expect(userHabit.STREAK_COUNT).toEqual(3);
//       expect(userHabitsRepository.save).toHaveBeenCalledWith(userHabit);

//       // Quest service should NOT be called since streak didn't increase
//       expect(questService.updateQuestProgress).not.toHaveBeenCalled();
//     });

//     it('should handle streak breaks correctly', async () => {
//       const challengeId = 10;
//       const userId = 1;

//       // Create userHabit with a streak break
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STREAK_COUNT: 5, // Current streak before update
//         habits: {
//           CATEGORY: HabitCategories.Exercise,
//         },
//         dailyTracks: [
//           {
//             TRACK_DATE: new Date('2023-01-03'), // Today
//             COMPLETED: true,
//           },
//           {
//             TRACK_DATE: new Date('2023-01-02'), // Yesterday
//             COMPLETED: false, // Streak break
//           },
//           {
//             TRACK_DATE: new Date('2023-01-01'), // 2 days ago
//             COMPLETED: true,
//           },
//         ],
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(userHabitsRepository, 'save')
//         .mockImplementation(async (entity) => entity as UserHabits);

//       // Execute the private method
//       await (service as any).updateStreakCount(challengeId);

//       // Verify streak was reset to 1
//       expect(userHabit.STREAK_COUNT).toEqual(1);
//       expect(userHabitsRepository.save).toHaveBeenCalledWith(userHabit);

//       // Quest service should not be called since streak decreased
//       expect(questService.updateQuestProgress).not.toHaveBeenCalled();
//     });
//   });

//   describe('checkChallengeCompletion', () => {
//     it('should mark challenge as completed when days goal is met and update completion quests', async () => {
//       const challengeId = 10;
//       const userId = 1;
//       const today = new Date();
//       const endDate = new Date(today);
//       endDate.setDate(today.getDate() - 1); // Challenge has ended

//       // Create a userHabit with completed goal
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STATUS: HabitStatus.Active,
//         DAYS_GOAL: 5, // Goal: complete 5 days
//         END_DATE: endDate, // Challenge has ended
//         habits: {
//           CATEGORY: HabitCategories.Exercise,
//           EXERCISE_TYPE: ExerciseType.Running,
//         },
//         dailyTracks: [
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: false },
//         ], // 5 completed days (meets goal)
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(userHabitsRepository, 'save')
//         .mockImplementation(async (entity) => entity as UserHabits);
//       jest.spyOn(dateService, 'getCurrentDate').mockReturnValue({
//         date: today.toISOString(),
//         timestamp: today.getTime(),
//         formattedDate: today.toISOString(),
//       });

//       // Execute the private method
//       await (service as any).checkChallengeCompletion(challengeId);

//       // Verify challenge was marked as completed
//       expect(userHabit.STATUS).toEqual(HabitStatus.Completed);
//       expect(userHabitsRepository.save).toHaveBeenCalledWith(userHabit);

//       // Verify quest service was called for completion
//       expect(questService.updateQuestProgress).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           category: HabitCategories.Exercise,
//           exerciseType: ExerciseType.Running,
//           trackingType: TrackingType.Count,
//           value: 1, // One completion
//           progressType: 'completion',
//         }),
//       );
//     });

//     it('should mark challenge as failed when days goal is not met', async () => {
//       const challengeId = 10;
//       const userId = 1;
//       const today = new Date();
//       const endDate = new Date(today);
//       endDate.setDate(today.getDate() - 1); // Challenge has ended

//       // Create a userHabit with incomplete goal
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         UID: userId,
//         STATUS: HabitStatus.Active,
//         DAYS_GOAL: 5, // Goal: complete 5 days
//         END_DATE: endDate, // Challenge has ended
//         habits: {
//           CATEGORY: HabitCategories.Exercise,
//         },
//         dailyTracks: [
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: false },
//           { COMPLETED: true },
//         ], // Only 3 completed days (does not meet goal)
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest
//         .spyOn(userHabitsRepository, 'save')
//         .mockImplementation(async (entity) => entity as UserHabits);
//       jest.spyOn(dateService, 'getCurrentDate').mockReturnValue({
//         date: today.toISOString(),
//         timestamp: today.getTime(),
//         formattedDate: today.toISOString(),
//       });

//       // Execute the private method
//       await (service as any).checkChallengeCompletion(challengeId);

//       // Verify challenge was marked as failed
//       expect(userHabit.STATUS).toEqual(HabitStatus.Failed);
//       expect(userHabitsRepository.save).toHaveBeenCalledWith(userHabit);

//       // Quest service should not be called for failed challenges
//       expect(questService.updateQuestProgress).not.toHaveBeenCalled();
//     });

//     it('should not change challenge status if not yet ended', async () => {
//       const challengeId = 10;
//       const today = new Date();
//       const endDate = new Date(today);
//       endDate.setDate(today.getDate() + 5); // Challenge is still active

//       // Create an active userHabit
//       const userHabit = {
//         CHALLENGE_ID: challengeId,
//         STATUS: HabitStatus.Active,
//         DAYS_GOAL: 5,
//         END_DATE: endDate, // Challenge has not ended yet
//         habits: {},
//         dailyTracks: [
//           { COMPLETED: true },
//           { COMPLETED: true },
//           { COMPLETED: true },
//         ],
//       } as UserHabits;

//       // Mock repository methods
//       jest.spyOn(userHabitsRepository, 'findOne').mockResolvedValue(userHabit);
//       jest.spyOn(dateService, 'getCurrentDate').mockReturnValue({
//         date: today.toISOString(),
//         timestamp: today.getTime(),
//         formattedDate: today.toISOString(),
//       });

//       // Execute the private method
//       await (service as any).checkChallengeCompletion(challengeId);

//       // Challenge status should remain active
//       expect(userHabit.STATUS).toEqual(HabitStatus.Active);

//       // Repository save should not be called
//       expect(userHabitsRepository.save).not.toHaveBeenCalled();
//       expect(questService.updateQuestProgress).not.toHaveBeenCalled();
//     });
//   });

//   describe('updateRelatedLogs', () => {
//     it('should create logs for exercise metrics', async () => {
//       const userId = 1;
//       const trackId = 123;
//       const trackDate = new Date('2023-01-15');

//       // Create a daily track with calculated metrics
//       const dailyTrack = {
//         TRACK_ID: trackId,
//         TRACK_DATE: trackDate,
//         STEPS_CALCULATED: 5000,
//         CALORIES_BURNED: 350,
//         HEART_RATE: 130,
//         UserHabits: {
//           habits: {
//             EXERCISE_TYPE: ExerciseType.Running,
//           },
//         },
//       } as DailyHabitTrack;

//       // Mock repository methods
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(dailyTrack);

//       // Execute the method
//       await service.updateRelatedLogs(userId, dailyTrack);

//       // Verify logs were created
//       expect(logService.create).toHaveBeenCalledTimes(3);

//       // Verify steps log
//       expect(logService.create).toHaveBeenCalledWith(
//         expect.objectContaining({
//           UID: userId,
//           DATE: trackDate,
//           VALUE: 5000,
//         }),
//       );

//       // Verify calories log
//       expect(logService.create).toHaveBeenCalledWith(
//         expect.objectContaining({
//           UID: userId,
//           DATE: trackDate,
//           VALUE: 350,
//         }),
//       );

//       // Verify heart rate log
//       expect(logService.create).toHaveBeenCalledWith(
//         expect.objectContaining({
//           UID: userId,
//           DATE: trackDate,
//           VALUE: 130,
//         }),
//       );
//     });

//     it('should not create logs if track has no calculated metrics', async () => {
//       const userId = 1;
//       const trackId = 123;

//       // Create a daily track with no metrics
//       const dailyTrack = {
//         TRACK_ID: trackId,
//         UserHabits: {
//           habits: {
//             EXERCISE_TYPE: ExerciseType.Running,
//           },
//         },
//       } as DailyHabitTrack;

//       // Mock repository methods
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(dailyTrack);

//       // Execute the method
//       await service.updateRelatedLogs(userId, dailyTrack);

//       // Verify no logs were created
//       expect(logService.create).not.toHaveBeenCalled();
//     });

//     it('should throw an error if track is not found', async () => {
//       const userId = 1;
//       const trackId = 999;

//       // Create a daily track
//       const dailyTrack = {
//         TRACK_ID: trackId,
//       } as DailyHabitTrack;

//       // Mock repository methods to return null (track not found)
//       jest.spyOn(dailyTrackRepository, 'findOne').mockResolvedValue(null);

//       // Execute the method and expect error
//       await expect(
//         service.updateRelatedLogs(userId, dailyTrack),
//       ).rejects.toThrow(`Not found trackId: ${trackId}`);
//     });
//   });
// });
