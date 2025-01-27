import { Quest, QuestType } from '@/.typeorm/entities/quest.entity';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
// import { QuestRepository } from '../repositories/quest.repository';
import { PaginatedResponse } from '@/response/response.interface';
import { QuestListFilter, QuestParams } from '../interfaces/quests.interfaces';
// import { UserQuestRepository } from '../repositories/user-quest.repository';
import { query } from 'express';
import {
  QuestStatus,
  UserQuests,
} from '@/.typeorm/entities/user-quests.entity';
import { QuestProgress } from '@/.typeorm/entities/quest-progress.entity';
import { CreateQuestDto } from '../dtos/create-quest.dto';
import {
  ExerciseType,
  HabitCategories,
  Habits,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { TrackQuestDto } from '../dtos/track-quest.dto';
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
  ) {}

  async createQuest(createQuestDto: CreateQuestDto): Promise<Quest> {
    const quest = this.questRepository.create(createQuestDto);
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
      .orderBy('quest.createAt', 'DESC');

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
      .getMany();

    // Create a set of active quest IDs for quick lookup
    const activeQuestIds = new Set(activeQuests.map((q) => q.QID));

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
          const userQuest = await this.userQuestsRepository.findOne({
            where: {
              QID: quest.QID,
              UID: userId,
              STATUS: QuestStatus.Active,
            },
            relations: ['quest'],
          });

          if (userQuest) {
            // Get all progress entries
            const progressEntries = await this.questProgressRepository.find({
              where: {
                QID: quest.QID,
                UID: userId,
              },
            });

            const totalProgress = progressEntries.reduce(
              (sum, entry) => sum + entry.VALUE_COMPLETED,
              0,
            );

            progressInfo = {
              startDate: userQuest.START_DATE,
              endDate: userQuest.END_DATE,
              currentValue: totalProgress,
              targetValue: quest.RQ_TARGET_VALUE,
              progressPercentage: Math.min(
                (totalProgress / quest.RQ_TARGET_VALUE) * 100,
                100,
              ),
              daysLeft: Math.max(
                0,
                Math.ceil(
                  (userQuest.END_DATE.getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24),
                ),
              ),
            };
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
          (userQuest.END_DATE.getTime() - new Date().getTime()) /
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
        case 'start':
          return (
            categoryMatch &&
            quest.TRACKING_TYPE === TrackingType.Count &&
            quest.QUEST_TYPE === QuestType.START_BASED
          );
        case 'daily_completion':
          return (
            categoryMatch &&
            quest.TRACKING_TYPE === TrackingType.Count &&
            quest.QUEST_TYPE === QuestType.DAILY_COMPLETION
          );
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
}

// @Injectable()
// export class QuestService {
//   constructor(
//     @InjectRepository(Quest)
//     private readonly questRepo: Repository<Quest>,
//     @InjectRepository(UserQuests)
//     private readonly userQuestRepo: Repository<UserQuests>,
//     private readonly quest: QuestRepository,
//     private readonly userQuest: UserQuestRepository,
//   ) {}

//   async searchQuests(params: QuestParams): Promise<PaginatedResponse<Quest>> {
//     const { data, total } = await this.quest.findAll(params);
//     const { page = 1, limit = 10 } = params;

//     // const userActive = awiat this.userQuest.findAll(),
//     return {
//       data,
//       meta: {
//         total,
//         page,
//         limit,
//         totalPages: Math.ceil(total / limit),
//       },
//     };
//   }

//   async getAvailableQuest(params: {
//     uid: number;
//     filterType: 'all' | 'active' | 'non-active';
//     query: string;
//   }): Promise<{
//     data: {
//       quest: Quest;
//       progress: UserQuests | null;
//     }[];
//     meta: {
//       total?: number;
//       page?: number;
//       limit?: number;
//       total_pages?: number;
//     };
//   }> {
//     const { uid, filterType = 'all', query } = params;

//     const userActiveQuests = await this.userQuestRepo.find({
//       where: { UID: uid, STATUS: QuestStatus.Active },
//       select: ['QID', 'UID', 'PROGRESS_PERCENTAGE', 'quest'],
//     });

//     const excludeIds = userActiveQuests.map((q) => q.QID);

//     const nonActiveQuests = await this.questRepo.find({
//       where: { QID: Not(In(excludeIds)) },
//     });

//     const nonActiveQuestsData = nonActiveQuests.map((q) => ({
//       quest: q,
//       progress: null,
//     }));

//     const activeQuestsData = userActiveQuests.map((uq) => ({
//       quest: uq.quest,
//       progress: uq,
//     }));

//     // fetch habit to update quest percentage

//     if (filterType === 'active') {
//       return {
//         data: activeQuestsData,
//         meta: {
//           total: activeQuestsData.length,
//         },
//       };
//     } else if (filterType === 'non-active') {
//       return {
//         data: nonActiveQuestsData,
//         meta: {
//           total: nonActiveQuestsData.length,
//         },
//       };
//     }

//     return {
//       data: [...activeQuestsData, ...nonActiveQuestsData].sort((a, b) => {
//         if (a.progress && !b.progress) return -1; // a is active, b is not
//         if (!a.progress && b.progress) return 1; // b is active, a is not

//         if (a.progress && b.progress) {
//           return (
//             b.progress.PROGRESS_PERCENTAGE - a.progress.PROGRESS_PERCENTAGE
//           );
//         }

//         return 0;
//       }),
//       meta: {
//         total: activeQuestsData.length + nonActiveQuests.length,
//       },
//     };
//   }

//   async getUserActiveQuest(uid: number) {
//     //tasks
//     //1. get all user active
//     //2. update each one progress
//     //3. return with updated progresss
//     const userQuest = await this.userQuestRepo.find({
//       where: { UID: uid, STATUS: QuestStatus.Active },
//     });

//     // //then update progress
//     // const updatedUserQuests = await this.updatedQuestProgress(
//     //   userQuest.map((uq) => ({ qid: uq.QID, uid: uq.UID })),
//     // );
//   }

//   async updatedQuestProgress(qid: number, uid: number) {
//     const userQuest = await this.userQuestRepo.findOne({
//       where: { QID: qid, UID: uid },
//       // relations: ['quest'],
//     });

//     if(userQuest.quest.RQ_TARGET_COUNT > 0) {
//       // fetch habits related with count-based categories
//     }
//     if(userQuest.quest.RQ_TARGET_DAYS_STREAK > 0) {
//       // fetch habits related with count-based categories
//     }
//     if(userQuest.quest.RQ_TARGET_KM_DISTANCE> 0) {
//       // fetch habits related with count-based categories
//     }
//     if(userQuest.quest.RQ_TARGET_MINUTES> 0) {
//       // if(userQuest.quest.category.)
//     }
//   }
// }
