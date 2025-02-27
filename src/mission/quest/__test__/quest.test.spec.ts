// import { Test, TestingModule } from '@nestjs/testing';
// import { QuestService } from '../../quest/services/quest.service';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Quest, QuestType } from '@/.typeorm/entities/quest.entity';
// import { UserQuests, QuestStatus } from '@/.typeorm/entities/user-quests.entity';
// import { QuestProgress } from '@/.typeorm/entities/quest-progress.entity';
// import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
// import { UserHabits, HabitStatus } from '@/.typeorm/entities/user-habits.entity';
// import { ImageService } from '@/image/image.service';
// import { 
//   ExerciseType, 
//   HabitCategories, 
//   Habits, 
//   TrackingType 
// } from '@/.typeorm/entities/habit.entity';
// import { Repository } from 'typeorm';
// import { User } from '@/.typeorm/entities/users.entity';

// describe('QuestService', () => {
//   let service: QuestService;
//   let questRepository: Repository<Quest>;
//   let userQuestsRepository: Repository<UserQuests>;
//   let questProgressRepository: Repository<QuestProgress>;
//   let userHabitsRepository: Repository<UserHabits>;
//   let dailyHabitTrackRepository: Repository<DailyHabitTrack>;
//   let imageService: ImageService;

//   const mockImageService = {
//     getImageUrl: jest.fn((filename) => `https://example.com/images/${filename}`),
//     deleteImageByUrl: jest.fn(),
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         QuestService,
//         {
//           provide: getRepositoryToken(Quest),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(UserQuests),
//           useClass: Repository,
//         },
//         {
//           provide: getRepositoryToken(QuestProgress),
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
//           provide: ImageService,
//           useValue: mockImageService,
//         },
//       ],
//     }).compile();

//     service = module.get<QuestService>(QuestService);
//     questRepository = module.get<Repository<Quest>>(getRepositoryToken(Quest));
//     userQuestsRepository = module.get<Repository<UserQuests>>(getRepositoryToken(UserQuests));
//     questProgressRepository = module.get<Repository<QuestProgress>>(getRepositoryToken(QuestProgress));
//     userHabitsRepository = module.get<Repository<UserHabits>>(getRepositoryToken(UserHabits));
//     dailyHabitTrackRepository = module.get<Repository<DailyHabitTrack>>(getRepositoryToken(DailyHabitTrack));
//     imageService = module.get<ImageService>(ImageService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });

//   describe('startQuest', () => {
//     it('should start a new quest for a user', async () => {
//       const userId = 1;
//       const questId = 10;
//       const today = new Date();
//       const endDate = new Date();
//       endDate.setDate(today.getDate() + 7);  // 7-day quest

//       const quest = {
//         QID: questId,
//         DAY_DURATION: 7,
//         RQ_TARGET_VALUE: 100,
//       } as Quest;

//       jest.spyOn(questRepository, 'findOne').mockResolvedValue(quest);
//       jest.spyOn(userQuestsRepository, 'findOne').mockResolvedValue(null);
//       jest.spyOn(userQuestsRepository, 'create').mockReturnValue({
//         QID: questId,
//         UID: userId,
//         START_DATE: today,
//         STATUS: QuestStatus.Active,
//         PROGRESS_PERCENTAGE: 0,
//       } as UserQuests);
//       jest.spyOn(userQuestsRepository, 'save').mockImplementation(async (entity) => entity as UserQuests);

//       const result = await service.startQuest(userId, questId);

//       expect(result).toBeDefined();
//       expect(result.QID).toEqual(questId);
//       expect(result.UID).toEqual(userId);
//       expect(result.STATUS).toEqual(QuestStatus.Active);
//       expect(questRepository.findOne).toHaveBeenCalledWith({ where: { QID: questId } });
//       expect(userQuestsRepository.save).toHaveBeenCalled();
//     });

//     it('should throw an error if quest does not exist', async () => {
//       jest.spyOn(questRepository, 'findOne').mockResolvedValue(null);

//       await expect(service.startQuest(1, 999)).rejects.toThrow('Quest not found');
//     });

//     it('should throw an error if quest is already active', async () => {
//       const quest = { QID: 1 } as Quest;
//       const activeQuest = { QID: 1, UID: 1, STATUS: QuestStatus.Active } as UserQuests;

//       jest.spyOn(questRepository, 'findOne').mockResolvedValue(quest);
//       jest.spyOn(userQuestsRepository, 'findOne').mockResolvedValue(activeQuest);

//       await expect(service.startQuest(1, 1)).rejects.toThrow('Quest already active');
//     });
//   });

//   describe('trackProgress', () => {
//     it('should track progress for a quest', async () => {
//       const userId = 1;
//       const questId = 10;
//       const trackDto = { QID: questId, value: 30 };
//       const userQuest = {
//         QID: questId,
//         UID: userId,
//         STATUS: QuestStatus.Active,
//         PROGRESS_PERCENTAGE: 0,
//         quest: {
//           RQ_TARGET_VALUE: 100,
//         },
//       } as UserQuests;
      
//       jest.spyOn(userQuestsRepository, 'findOne').mockResolvedValue(userQuest);
//       jest.spyOn(questProgressRepository, 'create').mockReturnValue({
//         QID: questId,
//         UID: userId,
//         TRACK_DATE: expect.any(Date),
//         VALUE_COMPLETED: 30,
//       } as QuestProgress);
//       jest.spyOn(questProgressRepository, 'save').mockImplementation(async (entity) => entity as QuestProgress);
//       jest.spyOn(questProgressRepository, 'find').mockResolvedValue([
//         { VALUE_COMPLETED: 30 } as QuestProgress
//       ]);
//       jest.spyOn(userQuestsRepository, 'save').mockImplementation(async (entity) => entity as UserQuests);

//       const result = await service.trackProgress(userId, trackDto);

//       expect(result).toBeDefined();
//       expect(result.QID).toEqual(questId);
//       expect(result.VALUE_COMPLETED).toEqual(30);
//       expect(userQuestsRepository.findOne).toHaveBeenCalled();
//       expect(questProgressRepository.create).toHaveBeenCalled();
//       expect(questProgressRepository.save).toHaveBeenCalled();
//       expect(userQuestsRepository.save).toHaveBeenCalled();
      
//       // Check if progress percentage is updated
//       expect(userQuest.PROGRESS_PERCENTAGE).toEqual(30); // 30 out of 100 = 30%
//     });

//     it('should mark quest as completed when progress reaches 100%', async () => {
//       const userId = 1;
//       const questId = 10;
//       const trackDto = { QID: questId, value: 100 };
//       const userQuest = {
//         QID: questId,
//         UID: userId,
//         STATUS: QuestStatus.Active,
//         PROGRESS_PERCENTAGE: 0,
//         quest: {
//           RQ_TARGET_VALUE: 100,
//         },
//       } as UserQuests;
      
//       jest.spyOn(userQuestsRepository, 'findOne').mockResolvedValue(userQuest);
//       jest.spyOn(questProgressRepository, 'create').mockReturnValue({
//         QID: questId,
//         UID: userId,
//         TRACK_DATE: expect.any(Date),
//         VALUE_COMPLETED: 100,
//       } as QuestProgress);
//       jest.spyOn(questProgressRepository, 'save').mockImplementation(async (entity) => entity as QuestProgress);
//       jest.spyOn(questProgressRepository, 'find').mockResolvedValue([
//         { VALUE_COMPLETED: 100 } as QuestProgress
//       ]);
//       jest.spyOn(userQuestsRepository, 'save').mockImplementation(async (entity) => entity as UserQuests);

//       await service.trackProgress(userId, trackDto);

//       expect(userQuest.STATUS).toEqual(QuestStatus.Completed);
//       expect(userQuest.PROGRESS_PERCENTAGE).toEqual(100);
//     });
//   });

//   describe('syncQuestProgress', () => {
//     it('should handle normal quest progress sync', async () => {
//       // Mock private method using any type
//       const syncNormalQuestProgressSpy = jest.spyOn(service as any, 'syncNormalQuestProgress');
//       syncNormalQuestProgressSpy.mockImplementation(jest.fn());

//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date(),
//         END_DATE: new Date(),
//         quest: {
//           QUEST_TYPE: QuestType.NORMAL,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { TRACK_ID: 1, UserHabits: { habits: { CATEGORY: HabitCategories.Exercise } } },
//       ] as DailyHabitTrack[];

//       jest.spyOn(dailyHabitTrackRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(habitTracks),
//       } as any);

//       // Call the private method directly
//       await (service as any).syncQuestProgress(userId, userQuest);

//       expect(syncNormalQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         userQuest,
//         expect.any(Array)
//       );
//     });

//     it('should handle streak-based quest progress sync', async () => {
//       // Mock private method
//       const syncStreakQuestProgressSpy = jest.spyOn(service as any, 'syncStreakQuestProgress');
//       syncStreakQuestProgressSpy.mockImplementation(jest.fn());

//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date(),
//         END_DATE: new Date(),
//         quest: {
//           QUEST_TYPE: QuestType.STREAK_BASED,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { 
//           TRACK_ID: 1, 
//           TRACK_DATE: new Date(), 
//           UserHabits: { habits: { CATEGORY: HabitCategories.Exercise } } 
//         },
//       ] as DailyHabitTrack[];

//       jest.spyOn(dailyHabitTrackRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(habitTracks),
//       } as any);

//       await (service as any).syncQuestProgress(userId, userQuest);

//       expect(syncStreakQuestProgressSpy).toHaveBeenCalled();
//     });

//     it('should handle completion-based quest progress sync', async () => {
//       // Mock private method
//       const syncCompletionBasedProgressSpy = jest.spyOn(service as any, 'syncCompletionBasedProgress');
//       syncCompletionBasedProgressSpy.mockImplementation(jest.fn());

//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date(),
//         END_DATE: new Date(),
//         quest: {
//           QUEST_TYPE: QuestType.COMPLETION_BASED,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { TRACK_ID: 1, UserHabits: { habits: { CATEGORY: HabitCategories.Exercise } } },
//       ] as DailyHabitTrack[];

//       jest.spyOn(dailyHabitTrackRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(habitTracks),
//       } as any);

//       await (service as any).syncQuestProgress(userId, userQuest);

//       expect(syncCompletionBasedProgressSpy).toHaveBeenCalledWith(userId, userQuest);
//     });

//     it('should handle daily completion quest progress sync', async () => {
//       // Mock private method
//       const syncDailyCompletionProgressSpy = jest.spyOn(service as any, 'syncDailyCompletionProgress');
//       syncDailyCompletionProgressSpy.mockImplementation(jest.fn());

//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date(),
//         END_DATE: new Date(),
//         quest: {
//           QUEST_TYPE: QuestType.DAILY_COMPLETION_BASED,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { 
//           TRACK_ID: 1, 
//           TRACK_DATE: new Date(), 
//           UserHabits: { habits: { CATEGORY: HabitCategories.Exercise } } 
//         },
//       ] as DailyHabitTrack[];

//       jest.spyOn(dailyHabitTrackRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: jest.fn().mockReturnThis(),
//         where: jest.fn().mockReturnThis(),
//         andWhere: jest.fn().mockReturnThis(),
//         getMany: jest.fn().mockResolvedValue(habitTracks),
//       } as any);

//       await (service as any).syncQuestProgress(userId, userQuest);

//       expect(syncDailyCompletionProgressSpy).toHaveBeenCalled();
//     });
//   });

//   describe('getDailyThreshold', () => {
//     it('should calculate threshold for normal quests', () => {
//       const quest = {
//         QUEST_TYPE: QuestType.NORMAL,
//         RQ_TARGET_VALUE: 140,
//         DAY_DURATION: 7,
//       } as Quest;

//       const threshold = (service as any).getDailyThreshold(quest);
//       expect(threshold).toEqual(20); // 140 / 7 = 20
//     });

//     it('should use RQ_TARGET_VALUE as threshold for streak quests', () => {
//       const quest = {
//         QUEST_TYPE: QuestType.STREAK_BASED,
//         RQ_TARGET_VALUE: 30, // 30 minutes per day
//         DAY_DURATION: 7,
//       } as Quest;

//       const threshold = (service as any).getDailyThreshold(quest);
//       expect(threshold).toEqual(30);
//     });

//     it('should return default value if no thresholds specified', () => {
//       const quest = {
//         QUEST_TYPE: QuestType.NORMAL,
//         RQ_TARGET_VALUE: 0,
//         DAY_DURATION: 7,
//       } as Quest;

//       const threshold = (service as any).getDailyThreshold(quest);
//       expect(threshold).toEqual(1); // Default value
//     });
//   });

//   describe('syncNormalQuestProgress', () => {
//     it('should aggregate duration values correctly', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//           TRACKING_TYPE: TrackingType.Duration,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { DURATION_MINUTES: 20 },
//         { DURATION_MINUTES: 30 },
//         { DURATION_MINUTES: 15 },
//       ] as DailyHabitTrack[];

//       // Mock methods
//       jest.spyOn(questProgressRepository, 'find').mockResolvedValue([]);
      
//       // Create a spy for updateQuestProgress
//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       // Call the private method directly
//       await (service as any).syncNormalQuestProgress(userId, userQuest, habitTracks);

//       // Check if updateQuestProgress was called with the correct total
//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 65, // 20 + 30 + 15
//           trackingType: TrackingType.Duration,
//         })
//       );
//     });

//     it('should aggregate distance values correctly', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//           TRACKING_TYPE: TrackingType.Distance,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { DISTANCE_KM: 2.5 },
//         { DISTANCE_KM: 3.0 },
//         { DISTANCE_KM: 1.5 },
//       ] as DailyHabitTrack[];

//       jest.spyOn(questProgressRepository, 'find').mockResolvedValue([]);
//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncNormalQuestProgress(userId, userQuest, habitTracks);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 7, // 2.5 + 3.0 + 1.5
//           trackingType: TrackingType.Distance,
//         })
//       );
//     });

//     it('should handle boolean tracking type correctly', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           RELATED_HABIT_CATEGORY: HabitCategories.Sleep,
//           TRACKING_TYPE: TrackingType.Boolean,
//         },
//       } as UserQuests;

//       const habitTracks = [
//         { COMPLETED: true },
//         { COMPLETED: true },
//         { COMPLETED: false },
//       ] as DailyHabitTrack[];

//       jest.spyOn(questProgressRepository, 'find').mockResolvedValue([]);
//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncNormalQuestProgress(userId, userQuest, habitTracks);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 2, // 2 completed entries
//           trackingType: TrackingType.Boolean,
//         })
//       );
//     });
//   });

//   describe('syncStreakQuestProgress', () => {
//     it('should calculate streak correctly with consecutive days', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           TRACKING_TYPE: TrackingType.Boolean,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       // Create tracks for 3 consecutive days, all completed
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const twoDaysAgo = new Date(today);
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

//       const tracksByDate = new Map<string, DailyHabitTrack[]>([
//         [twoDaysAgo.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//         [yesterday.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//         [today.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//       ]);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncStreakQuestProgress(userId, userQuest, tracksByDate);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 3, // 3-day streak
//           progressType: 'streak',
//         })
//       );
//     });

//     it('should break streak when a day is missed', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           TRACKING_TYPE: TrackingType.Boolean,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       // Create tracks with a gap in the middle
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const threeDaysAgo = new Date(today);
//       threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

//       const tracksByDate = new Map<string, DailyHabitTrack[]>([
//         [threeDaysAgo.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//         // Missing day in between
//         [yesterday.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//         [today.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//       ]);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncStreakQuestProgress(userId, userQuest, tracksByDate);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 2, // 2-day streak (today + yesterday)
//           progressType: 'streak',
//         })
//       );
//     });

//     it('should handle quantity thresholds for streaks', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           TRACKING_TYPE: TrackingType.Duration,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//           RQ_TARGET_VALUE: 20, // Minimum 20 minutes per day
//         },
//       } as UserQuests;

//       // Create tracks for 3 days, but day 2 doesn't meet threshold
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const twoDaysAgo = new Date(today);
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

//       const tracksByDate = new Map<string, DailyHabitTrack[]>([
//         [twoDaysAgo.toISOString().split('T')[0], [{ DURATION_MINUTES: 30 } as DailyHabitTrack]],
//         [yesterday.toISOString().split('T')[0], [{ DURATION_MINUTES: 15 } as DailyHabitTrack]], // Below threshold
//         [today.toISOString().split('T')[0], [{ DURATION_MINUTES: 25 } as DailyHabitTrack]],
//       ]);

//       // Mock getDailyThreshold
//       jest.spyOn(service as any, 'getDailyThreshold').mockReturnValue(20);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncStreakQuestProgress(userId, userQuest, tracksByDate);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 1, // Only today is a streak, yesterday broke it
//           progressType: 'streak',
//         })
//       );
//     });
//   });

//   describe('syncCompletionBasedProgress', () => {
//     it('should count completed habit challenges correctly', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date('2023-01-01'),
//         END_DATE: new Date('2023-01-31'),
//         quest: {
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//         },
//       } as UserQuests;

//       // Mock the repository to return 3 completed challenges
//       jest.spyOn(userHabitsRepository, 'count').mockResolvedValue(3);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncCompletionBasedProgress(userId, userQuest);

//       expect(userHabitsRepository.count).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: expect.objectContaining({
//             UID: userId,
//             STATUS: HabitStatus.Completed,
//             habits: { CATEGORY: HabitCategories.Exercise },
//           }),
//         })
//       );

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 3,
//           progressType: 'completion',
//         })
//       );
//     });

//     it('should filter by exercise type if specified', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         START_DATE: new Date('2023-01-01'),
//         END_DATE: new Date('2023-01-31'),
//         quest: {
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//           EXERCISE_TYPE: ExerciseType.Running,
//         },
//       } as UserQuests;

//       jest.spyOn(userHabitsRepository, 'count').mockResolvedValue(2);
//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncCompletionBasedProgress(userId, userQuest);

//       expect(userHabitsRepository.count).toHaveBeenCalledWith(
//         expect.objectContaining({
//           where: expect.objectContaining({
//             habits: { 
//               CATEGORY: HabitCategories.Exercise,
//               EXERCISE_TYPE: ExerciseType.Running,
//             },
//           }),
//         })
//       );
//     });
//   });

//   describe('syncDailyCompletionProgress', () => {
//     it('should count days with completed habits correctly', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           TRACKING_TYPE: TrackingType.Boolean,
//           RELATED_HABIT_CATEGORY: HabitCategories.Diet,
//         },
//       } as UserQuests;

//       // Create tracks for several days, some completed, some not
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const twoDaysAgo = new Date(today);
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

//       const tracksByDate = new Map<string, DailyHabitTrack[]>([
//         [twoDaysAgo.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//         [yesterday.toISOString().split('T')[0], [{ COMPLETED: false } as DailyHabitTrack]],
//         [today.toISOString().split('T')[0], [{ COMPLETED: true } as DailyHabitTrack]],
//       ]);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncDailyCompletionProgress(userId, userQuest, tracksByDate);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 2, // 2 days completed (today and two days ago)
//           progressType: 'daily_completion',
//         })
//       );
//     });

//     it('should use quantity thresholds for daily completion', async () => {
//       const userId = 1;
//       const userQuest = {
//         QID: 10,
//         UID: userId,
//         quest: {
//           TRACKING_TYPE: TrackingType.Duration,
//           RELATED_HABIT_CATEGORY: HabitCategories.Exercise,
//           RQ_TARGET_VALUE: 30, // Minimum 30 minutes per day
//         },
//       } as UserQuests;

//       // Create tracks for 3 days with different durations
//       const today = new Date();
//       const yesterday = new Date(today);
//       yesterday.setDate(yesterday.getDate() - 1);
//       const twoDaysAgo = new Date(today);
//       twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

//       const tracksByDate = new Map<string, DailyHabitTrack[]>([
//         [twoDaysAgo.toISOString().split('T')[0], [{ DURATION_MINUTES: 35 } as DailyHabitTrack]],
//         [yesterday.toISOString().split('T')[0], [{ DURATION_MINUTES: 20 } as DailyHabitTrack]], // Below threshold
//         [today.toISOString().split('T')[0], [{ DURATION_MINUTES: 40 } as DailyHabitTrack]],
//       ]);

//       // Mock getDailyThreshold
//       jest.spyOn(service as any, 'getDailyThreshold').mockReturnValue(30);

//       const updateQuestProgressSpy = jest.spyOn(service, 'updateQuestProgress');
//       updateQuestProgressSpy.mockImplementation(jest.fn());

//       await (service as any).syncDailyCompletionProgress(userId, userQuest, tracksByDate);

//       expect(updateQuestProgressSpy).toHaveBeenCalledWith(
//         userId,
//         expect.objectContaining({
//           value: 2, // 2 days meet the threshold (today and two days ago)
//           progressType: 'daily_completion',
//         })
//       );
//     });
//   });
// });