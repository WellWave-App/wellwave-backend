import { Quest, QuestType } from '@/.typeorm/entities/quest.entity';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestListFilter } from '../interfaces/quests.interfaces';
import {
  QuestStatus,
  UserQuests,
} from '@/.typeorm/entities/user-quests.entity';
import { QuestProgress } from '@/.typeorm/entities/quest-progress.entity';
import { CreateQuestDto } from '../dtos/create-quest.dto';
import {
  ExerciseType,
  HabitCategories,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { TrackQuestDto } from '../dtos/track-quest.dto';
import { ImageService } from '@/image/image.service';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(UserQuests)
    private userQuestsRepository: Repository<UserQuests>,
    @InjectRepository(QuestProgress)
    private questProgressRepository: Repository<QuestProgress>,
    private readonly imageService: ImageService,
    @InjectRepository(DailyHabitTrack)
    private dailyHabitTrackRepository: Repository<DailyHabitTrack>,
  ) {}

  async createQuest(
    createQuestDto: CreateQuestDto,
    file: Express.Multer.File,
  ): Promise<Quest> {
    const quest = this.questRepository.create(createQuestDto);
    if (file) {
      createQuestDto.IMG_URL = this.imageService.getImageUrl(file.filename);
    }
    return await this.questRepository.save(quest);
  }

  async getQuests(
    userId: number,
    filter: QuestListFilter = QuestListFilter.ALL,
    category?: HabitCategories,
  ): Promise<any[]> {
    // Get all quests first
    const questsQuery = this.questRepository
      .createQueryBuilder('quest')
      .orderBy('quest.CREATED_AT', 'DESC');

    if (category) {
      questsQuery.where('quest.RELATED_HABIT_CATEGORY = :category', {
        category,
      });
    }

    const allQuests = await questsQuery.getMany();

    // Get user's active quests
    const activeQuests = await this.userQuestsRepository
      .createQueryBuilder('userQuest')
      .where('userQuest.UID = :userId', { userId })
      .andWhere('userQuest.STATUS = :status', { status: QuestStatus.Active })
      .leftJoinAndSelect('userQuest.quest', 'quest')
      .getMany();

    // Create a set of active quest IDs for quick lookup
    const activeQuestIds = new Set(activeQuests.map((q) => q.QID));

    // For each active quest, sync progress with habit tracks
    for (const userQuest of activeQuests) {
      await this.syncQuestProgress(userId, userQuest);
    }

    // Filter quests based on selected filter
    let filteredQuests = allQuests;
    switch (filter) {
      case QuestListFilter.DOING:
        filteredQuests = allQuests.filter((quest) =>
          activeQuestIds.has(quest.QID),
        );
        break;
      case QuestListFilter.NOT_DOING:
        filteredQuests = allQuests.filter(
          (quest) => !activeQuestIds.has(quest.QID),
        );
        break;
    }

    // Enhance quests with active status and progress info
    return await Promise.all(
      filteredQuests.map(async (quest) => {
        const isActive = activeQuestIds.has(quest.QID);
        let progressInfo = null;

        if (isActive) {
          // const userQuest = activeQuests.find((uq) => uq.QID === quest.QID);
          const userQuest = await this.userQuestsRepository.findOne({
            where: {
              QID: quest.QID,
              UID: userId,
              STATUS: QuestStatus.Active,
            },
            relations: ['quest'],
          });

          if (userQuest) {
            progressInfo = await this.getQuestProgressInfo(userQuest);
          }
        }

        return {
          ...quest,
          isActive,
          progressInfo,
        };
      }),
    );
  }

  async startQuest(userId: number, questId: number): Promise<UserQuests> {
    // Check if quest exists
    const quest = await this.questRepository.findOne({
      where: { QID: questId },
    });

    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    // Check if user already has this quest active
    const existingQuest = await this.userQuestsRepository.findOne({
      where: {
        QID: questId,
        UID: userId,
        STATUS: QuestStatus.Active,
      },
    });

    if (existingQuest) {
      throw new ConflictException('Quest already active');
    }

    // Create new user quest
    const userQuest = this.userQuestsRepository.create({
      QID: questId,
      UID: userId,
      START_DATE: new Date(),
      STATUS: QuestStatus.Active,
      PROGRESS_PERCENTAGE: 0,
    });

    // Calculate end date based on quest duration
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + quest.DAY_DURATION);
    userQuest.END_DATE = endDate;

    return await this.userQuestsRepository.save(userQuest);
  }

  async trackProgress(
    userId: number,
    trackDto: TrackQuestDto,
  ): Promise<QuestProgress> {
    const userQuest = await this.userQuestsRepository.findOne({
      where: {
        QID: trackDto.QID,
        UID: userId,
        STATUS: QuestStatus.Active,
      },
      relations: ['quest'],
    });

    if (!userQuest) {
      throw new NotFoundException('Active quest not found');
    }

    // Create progress entry
    const progress = this.questProgressRepository.create({
      QID: trackDto.QID,
      UID: userId,
      TRACK_DATE: new Date(),
      VALUE_COMPLETED: trackDto.value,
    });

    await this.questProgressRepository.save(progress);

    // Update total progress
    const allProgress = await this.questProgressRepository.find({
      where: {
        QID: trackDto.QID,
        UID: userId,
      },
    });

    const totalProgress = allProgress.reduce(
      (sum, entry) => sum + entry.VALUE_COMPLETED,
      0,
    );

    userQuest.PROGRESS_PERCENTAGE = Math.min(
      (totalProgress / userQuest.quest.RQ_TARGET_VALUE) * 100,
      100,
    );

    // Check if quest is completed
    if (userQuest.PROGRESS_PERCENTAGE >= 100) {
      userQuest.STATUS = QuestStatus.Completed;
      // TODO: Implement reward system
      // await this.rewardService.awardQuestCompletion(userQuest);
    }

    await this.userQuestsRepository.save(userQuest);

    return progress;
  }

  async getQuestStats(userId: number, questId: number): Promise<any> {
    const userQuest = await this.userQuestsRepository.findOne({
      where: {
        QID: questId,
        UID: userId,
      },
      relations: ['quest'],
    });

    if (!userQuest) {
      throw new NotFoundException('Quest not found');
    }

    const progressEntries = await this.questProgressRepository.find({
      where: {
        QID: questId,
        UID: userId,
      },
      order: {
        TRACK_DATE: 'ASC',
      },
    });

    const totalProgress = progressEntries.reduce(
      (sum, entry) => sum + entry.VALUE_COMPLETED,
      0,
    );

    return {
      startDate: userQuest.START_DATE,
      endDate: userQuest.END_DATE,
      status: userQuest.STATUS,
      currentValue: totalProgress,
      targetValue: userQuest.quest.RQ_TARGET_VALUE,
      progressPercentage: userQuest.PROGRESS_PERCENTAGE,
      progressHistory: progressEntries,
      daysLeft: Math.max(
        0,
        Math.ceil(
          (new Date(userQuest.END_DATE).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    };
  }

  async updateQuestProgress(
    userId: number,
    trackingData: {
      category: HabitCategories;
      exerciseType?: ExerciseType;
      trackingType: TrackingType;
      value: number;
      date: Date;
      progressType?:
        | 'normal'
        | 'streak'
        | 'completion'
        | 'start'
        | 'daily_completion';
    },
  ): Promise<void> {
    const activeQuests = await this.userQuestsRepository.find({
      where: {
        UID: userId,
        STATUS: QuestStatus.Active,
      },
      relations: ['quest'],
    });

    // Filter relevant quests based on tracking type and progress type
    const relevantQuests = activeQuests.filter((userQuest) => {
      const quest = userQuest.quest;

      // Basic category and type matching
      const categoryMatch =
        quest.RELATED_HABIT_CATEGORY === trackingData.category;
      const exerciseTypeMatch =
        !quest.EXERCISE_TYPE ||
        quest.EXERCISE_TYPE === trackingData.exerciseType;

      // Special handling for different progress types
      switch (trackingData.progressType) {
        case 'streak':
          return (
            categoryMatch &&
            quest.TRACKING_TYPE === TrackingType.Count &&
            quest.QUEST_TYPE === QuestType.STREAK_BASED
          );
        case 'completion':
          return (
            categoryMatch &&
            quest.TRACKING_TYPE === TrackingType.Count &&
            quest.QUEST_TYPE === QuestType.COMPLETION_BASED
          );
        case 'daily_completion':
          return (
            categoryMatch &&
            quest.TRACKING_TYPE === TrackingType.Count &&
            quest.QUEST_TYPE === QuestType.DAILY_COMPLETION
          );
        // case 'start':
        //   return (
        //     categoryMatch &&
        //     quest.TRACKING_TYPE === TrackingType.Count &&
        //     quest.QUEST_TYPE === QuestType.START_BASED
        //   );
        default:
          return (
            categoryMatch &&
            exerciseTypeMatch &&
            quest.TRACKING_TYPE === trackingData.trackingType
          );
      }
    });

    // Update progress for each relevant quest
    for (const userQuest of relevantQuests) {
      await this.trackProgress(userId, {
        QID: userQuest.QID,
        value: trackingData.value,
      });
    }
  }

  private async syncQuestProgress(
    userId: number,
    userQuest: UserQuests,
  ): Promise<void> {
    const quest = userQuest.quest;
    const startDate = userQuest.START_DATE;
    const endDate = userQuest.END_DATE;

    // Get all relevant habit tracks within quest period
    const habitTracks = await this.dailyHabitTrackRepository
      .createQueryBuilder('track')
      .leftJoinAndSelect('track.UserHabits', 'userHabit')
      .leftJoinAndSelect('userHabit.habits', 'habit')
      .where('userHabit.UID = :userId', { userId })
      .andWhere('track.TRACK_DATE >= :startDate', { startDate })
      .andWhere('track.TRACK_DATE <= :endDate', { endDate })
      .andWhere('habit.CATEGORY = :category', {
        category: quest.RELATED_HABIT_CATEGORY,
      })
      .andWhere('track.COMPLETED = :completed', { completed: true })
      .getMany();

    // Group tracks by date for processing
    const tracksByDate = new Map<string, DailyHabitTrack[]>();
    for (const track of habitTracks) {
      const dateKey = new Date(track.TRACK_DATE).toISOString().split('T')[0];
      if (!tracksByDate.has(dateKey)) {
        tracksByDate.set(dateKey, []);
      }
      tracksByDate.get(dateKey).push(track);
    }

    // Process tracks based on quest type
    switch (quest.QUEST_TYPE) {
      case QuestType.NORMAL:
        await this.syncNormalQuestProgress(userId, userQuest, habitTracks);
        break;
      case QuestType.STREAK_BASED:
        await this.syncStreakQuestProgress(userId, userQuest, tracksByDate);
        break;
      case QuestType.DAILY_COMPLETION:
        await this.syncDailyCompletionProgress(userId, userQuest, tracksByDate);
        break;
      case QuestType.COMPLETION_BASED:
        // TODO: Implement completion-based quest progress sync.
        break;
      // case QuestType.START_BASED:
      //   // TODO: Implement start-based quest progress sync.
      //   break;
      // Other quest types...
    }
  }

  private async syncNormalQuestProgress(
    userId: number,
    userQuest: UserQuests,
    habitTracks: DailyHabitTrack[],
  ): Promise<void> {
    // Calculate total value based on tracking type
    let totalValue = 0;
    for (const track of habitTracks) {
      switch (userQuest.quest.TRACKING_TYPE) {
        case TrackingType.Duration:
          totalValue += track.DURATION_MINUTES || 0;
          break;
        case TrackingType.Distance:
          totalValue += track.DISTANCE_KM || 0;
          break;
        case TrackingType.Count:
          totalValue += track.COUNT_VALUE || 0;
          break;
      }
    }

    // Update quest progress if there's untracked progress
    const currentProgress = await this.questProgressRepository.find({
      where: {
        QID: userQuest.QID,
        UID: userId,
      },
    });

    const trackedTotal = currentProgress.reduce(
      (sum, progress) => sum + progress.VALUE_COMPLETED,
      0,
    );

    if (totalValue > trackedTotal) {
      const unTrackedValue = totalValue - trackedTotal;
      await this.updateQuestProgress(userId, {
        category: userQuest.quest.RELATED_HABIT_CATEGORY,
        exerciseType: userQuest.quest.EXERCISE_TYPE,
        trackingType: userQuest.quest.TRACKING_TYPE,
        value: unTrackedValue,
        date: new Date(),
        progressType: 'normal',
      });
    }
  }

  private async syncStreakQuestProgress(
    userId: number,
    userQuest: UserQuests,
    tracksByDate: Map<string, DailyHabitTrack[]>,
  ): Promise<void> {
    // Calculate current streak
    const dates = Array.from(tracksByDate.keys()).sort();
    let currentStreak = 0;

    for (let i = dates.length - 1; i >= 0; i--) {
      const tracks = tracksByDate.get(dates[i]);
      if (tracks.some((track) => track.COMPLETED)) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update streak progress if necessary
    await this.updateQuestProgress(userId, {
      category: userQuest.quest.RELATED_HABIT_CATEGORY,
      trackingType: TrackingType.Count,
      value: currentStreak,
      date: new Date(),
      progressType: 'streak',
    });
  }

  private async syncDailyCompletionProgress(
    userId: number,
    userQuest: UserQuests,
    tracksByDate: Map<string, DailyHabitTrack[]>,
  ): Promise<void> {
    // Count days with completed habits
    const completedDays = Array.from(tracksByDate.values()).filter((tracks) =>
      tracks.some((track) => track.COMPLETED),
    ).length;

    // Update daily completion progress
    await this.updateQuestProgress(userId, {
      category: userQuest.quest.RELATED_HABIT_CATEGORY,
      trackingType: TrackingType.Count,
      value: completedDays,
      date: new Date(),
      progressType: 'daily_completion',
    });
  }

  private async getQuestProgressInfo(userQuest: UserQuests): Promise<any> {
    const progressEntries = await this.questProgressRepository.find({
      where: {
        QID: userQuest.QID,
        UID: userQuest.UID,
      },
    });

    const totalProgress = progressEntries.reduce(
      (sum, entry) => sum + entry.VALUE_COMPLETED,
      0,
    );
    // return { data: userQuest.quest.RQ_TARGET_VALUE };
    return {
      startDate: userQuest.START_DATE,
      endDate: userQuest.END_DATE,
      currentValue: totalProgress,
      targetValue: userQuest.quest.RQ_TARGET_VALUE,
      progressPercentage: Number(
        Math.min(
          (totalProgress / userQuest.quest.RQ_TARGET_VALUE) * 100,
          100,
        ).toFixed(2),
      ),

      daysLeft: Math.max(
        0,
        Math.ceil(
          (new Date(userQuest.END_DATE).getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24),
        ),
      ),
    };
  }

  async remove(qid: number) {
    const quest = await this.questRepository.findOneBy({
      QID: qid,
    });

    if (!quest) {
      throw new NotFoundException(`Quest with ID ${qid} not found`);
    }

    const iconUrls = quest.IMG_URL;

    await this.questRepository.remove(quest);

    // Clean up associated images
    await this.imageService.deleteImageByUrl(iconUrls);

    return {
      message: `Quest ${quest.TITLE} has been successfully deleted`,
      qid: qid,
    };
  }
}
