import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { QUEST_TYPE, QuestEntity } from '../.typeorm/entities/quest.entity';
import { UserEntity } from 'src/.typeorm/entities/users.entity';
import { CreateQuestDto, JoinQuestDto, QuestFilterType } from './dto/quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';
import { HABIT_TYPE } from 'src/.typeorm/entities/habit.entity';
import { UserQuestEntity } from '../.typeorm/entities/user-quest.entity';
import { UserHabitTrackEntity } from 'src/.typeorm/entities/user-habit-track.entity';

@Injectable()
export class QuestService {
  constructor(
    @InjectRepository(QuestEntity)
    private questRepository: Repository<QuestEntity>,
    @InjectRepository(UserQuestEntity)
    private userQuestRepository: Repository<UserQuestEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserHabitTrackEntity)
    private userHabitTrackRepository: Repository<UserHabitTrackEntity>,
  ) {}

  async getAllQuests(): Promise<QuestEntity[]> {
    return this.questRepository.find();
  }

  async getUserQuests(userId: number): Promise<UserQuestEntity[]> {
    return this.userQuestRepository.find({
      where: { UID: userId },
      relations: ['quest'],
    });
  }

  async createQuest(createQuestDto: CreateQuestDto): Promise<QuestEntity> {
    try {
      // Validate required fields based on quest type
      this.validateQuestRequirements(createQuestDto);

      // Create the quest
      const quest = this.questRepository.create(createQuestDto);
      return await this.questRepository.save(quest);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create quest: ${error.message}`,
      );
    }
  }

  async updateQuest(
    questId: number,
    updateQuestDto: UpdateQuestDto,
  ): Promise<QuestEntity> {
    try {
      // Check if quest exists and has active participants
      const quest = await this.questRepository.findOne({
        where: { QID: questId },
      });

      if (!quest) {
        throw new NotFoundException('Quest not found');
      }

      // Check for active participants
      const activeParticipants = await this.userQuestRepository.count({
        where: {
          QID: questId,
          STATUS: false,
          END_DATE: MoreThanOrEqual(new Date()),
        },
      });

      if (activeParticipants > 0) {
        throw new BadRequestException(
          'Cannot update quest with active participants',
        );
      }

      // If quest type is changed, validate new requirements
      if (
        updateQuestDto.QUEST_TYPE &&
        updateQuestDto.QUEST_TYPE !== quest.QUEST_TYPE
      ) {
        this.validateQuestRequirements({
          ...quest,
          ...updateQuestDto,
        });
      }

      // Update the quest
      Object.assign(quest, updateQuestDto);
      return await this.questRepository.save(quest);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update quest: ${error.message}`,
      );
    }
  }

  private validateQuestRequirements(quest: CreateQuestDto | QuestEntity) {
    switch (quest.QUEST_TYPE) {
      case QUEST_TYPE.EXERCISE_DURATION:
        if (!quest.RQ_ACTIVITY_TARGET_TIME) {
          throw new BadRequestException(
            'Exercise duration quest requires RQ_ACTIVITY_TARGET_TIME',
          );
        }
        break;

      case QUEST_TYPE.EXERCISE_STREAK:
      case QUEST_TYPE.DIET_STREAK:
      case QUEST_TYPE.SLEEP_STREAK:
      case QUEST_TYPE.DAILY_ALL:
        if (!quest.RQ_SUCCESS_HABIT) {
          throw new BadRequestException(
            `${quest.QUEST_TYPE} quest requires RQ_SUCCESS_HABIT`,
          );
        }
        break;

      case QUEST_TYPE.EXERCISE_SESSIONS:
      case QUEST_TYPE.DIET_SESSIONS:
        if (!quest.RQ_SUCCESS_HABIT) {
          throw new BadRequestException(
            `${quest.QUEST_TYPE} quest requires RQ_SUCCESS_HABIT (number of sessions)`,
          );
        }
        break;

      case QUEST_TYPE.SLEEP_DURATION:
        if (!quest.RQ_ACTIVITY_TARGET_TIME) {
          throw new BadRequestException(
            'Sleep duration quest requires RQ_ACTIVITY_TARGET_TIME',
          );
        }
        break;
    }
  }

  async deleteQuest(questId: number): Promise<void> {
    try {
      // Check if quest exists and has active participants
      const quest = await this.questRepository.findOne({
        where: { QID: questId },
      });

      if (!quest) {
        throw new NotFoundException('Quest not found');
      }

      // Check for active participants
      const activeParticipants = await this.userQuestRepository.count({
        where: {
          QID: questId,
          STATUS: false,
          END_DATE: MoreThanOrEqual(new Date()),
        },
      });

      if (activeParticipants > 0) {
        throw new BadRequestException(
          'Cannot delete quest with active participants',
        );
      }

      await this.questRepository.remove(quest);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to delete quest: ${error.message}`,
      );
    }
  }

  async getSpecificUserQuest(userId: number, questId: number): Promise<any> {
    try {
      // Find the specific user quest
      const userQuest = await this.userQuestRepository.findOne({
        where: {
          UID: userId,
          QID: questId,
          STATUS: false, // Only get active quests
        },
        relations: ['quest'],
      });

      if (!userQuest) {
        throw new NotFoundException(
          'User quest not found or already completed',
        );
      }

      // Calculate progress for the quest
      const progress = await this.calculateQuestProgress(userId, userQuest);

      // Calculate days left
      const daysLeft = this.calculateDaysLeft(userQuest.END_DATE);

      // Combine all information
      return {
        questId: userQuest.QID,
        questName: userQuest.quest.QUEST_TITLE,
        questType: userQuest.quest.QUEST_TYPE,
        description: userQuest.quest.DESCRIPTION,
        startDate: userQuest.START_DATE,
        endDate: userQuest.END_DATE,
        daysLeft,
        isExpired: new Date() > userQuest.END_DATE,
        requirements: {
          activityTargetTime: userQuest.quest.RQ_ACTIVITY_TARGET_TIME,
          successHabit: userQuest.quest.RQ_SUCCESS_HABIT,
        },
        rewards: {
          gem: userQuest.quest.GEM_REWARDS,
          exp: userQuest.quest.EXP_REWARDS,
        },
        progress: {
          current: progress.current,
          target: progress.target,
          percentage: progress.percentage,
        },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get specific user quest: ${error.message}`,
      );
    }
  }

  async getUserActiveQuests(userId: number): Promise<any[]> {
    try {
      const activeQuests = await this.userQuestRepository.find({
        where: {
          UID: userId,
          STATUS: false,
          END_DATE: MoreThanOrEqual(new Date()),
        },
        relations: ['quest'],
        order: {
          START_DATE: 'DESC',
        },
      });

      // Calculate progress for each active quest
      const questsWithProgress = await Promise.all(
        activeQuests.map(async (userQuest) => {
          const progress = await this.calculateQuestProgress(userId, userQuest);

          return {
            ...userQuest.quest,
            startDate: userQuest.START_DATE,
            endDate: userQuest.END_DATE,
            progress,
            daysLeft: this.calculateDaysLeft(userQuest.END_DATE),
            isExpired: new Date() > userQuest.END_DATE,
          };
        }),
      );

      return questsWithProgress;
    } catch (error) {
      throw new Error(`Failed to get user active quests: ${error.message}`);
    }
  }

  private async calculateQuestProgress(
    userId: number,
    userQuest: UserQuestEntity,
  ): Promise<any> {
    const quest = userQuest.quest;
    const startDate = userQuest.START_DATE;
    const endDate = userQuest.END_DATE;

    switch (quest.QUEST_TYPE) {
      case QUEST_TYPE.EXERCISE_DURATION: {
        // Calculate total exercise time
        const exerciseTracks = await this.userHabitTrackRepository.find({
          where: {
            UID: userId,
            TRACK_DATE: Between(startDate, endDate),
            STATUS: true,
            habit: {
              HABIT_TYPE: HABIT_TYPE.EXERCISE,
            },
          },
          relations: ['habit'],
        });

        const totalMinutes = exerciseTracks.reduce(
          (sum, track) => sum + track.TIME_USED,
          0,
        );
        const [hours, minutes] =
          quest.RQ_ACTIVITY_TARGET_TIME.split(':').map(Number);
        const targetMinutes = hours * 60 + minutes;

        return {
          current: totalMinutes,
          target: targetMinutes,
          percentage: Math.min(
            100,
            Math.round((totalMinutes / targetMinutes) * 100),
          ),
        };
      }

      case QUEST_TYPE.EXERCISE_STREAK: {
        const currentStreak = await this.getCurrentStreak(
          userId,
          HABIT_TYPE.EXERCISE,
        );
        return {
          current: currentStreak,
          target: quest.RQ_SUCCESS_HABIT,
          percentage: Math.min(
            100,
            Math.round((currentStreak / quest.RQ_SUCCESS_HABIT) * 100),
          ),
        };
      }

      case QUEST_TYPE.DIET_STREAK: {
        const currentStreak = await this.getCurrentStreak(
          userId,
          HABIT_TYPE.DIET,
        );
        return {
          current: currentStreak,
          target: quest.RQ_SUCCESS_HABIT,
          percentage: Math.min(
            100,
            Math.round((currentStreak / quest.RQ_SUCCESS_HABIT) * 100),
          ),
        };
      }

      case QUEST_TYPE.SLEEP_STREAK: {
        const currentStreak = await this.getCurrentStreak(
          userId,
          HABIT_TYPE.SLEEP,
        );
        return {
          current: currentStreak,
          target: quest.RQ_SUCCESS_HABIT,
          percentage: Math.min(
            100,
            Math.round((currentStreak / quest.RQ_SUCCESS_HABIT) * 100),
          ),
        };
      }

      case QUEST_TYPE.DAILY_ALL: {
        const completedDays = await this.getCompletedAllHabitsDays(
          userId,
          startDate,
          endDate,
        );
        return {
          current: completedDays,
          target: quest.RQ_SUCCESS_HABIT,
          percentage: Math.min(
            100,
            Math.round((completedDays / quest.RQ_SUCCESS_HABIT) * 100),
          ),
        };
      }

      default:
        return {
          current: 0,
          target: 0,
          percentage: 0,
        };
    }
  }

  private async getCurrentStreak(
    userId: number,
    habitType: HABIT_TYPE,
  ): Promise<number> {
    const tracks = await this.userHabitTrackRepository.find({
      where: {
        UID: userId,
        habit: {
          HABIT_TYPE: habitType,
        },
        STATUS: true,
      },
      order: {
        TRACK_DATE: 'DESC',
      },
      relations: ['habit'],
    });

    if (tracks.length === 0) return 0;
    return tracks[0].STREAK_COUNT;
  }

  private async getCompletedAllHabitsDays(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    // Get all user's active habits
    const activeHabits = await this.userHabitTrackRepository.find({
      where: {
        UID: userId,
        START_DATE: LessThanOrEqual(endDate),
        END_DATE: MoreThanOrEqual(startDate),
      },
      relations: ['habit'],
    });

    if (activeHabits.length === 0) return 0;

    // Group habits by date and check if all habits were completed each day
    const habitsByDate = new Map<string, boolean[]>();

    for (const habit of activeHabits) {
      const trackDate = habit.TRACK_DATE.toISOString().split('T')[0];
      if (!habitsByDate.has(trackDate)) {
        habitsByDate.set(trackDate, []);
      }
      habitsByDate.get(trackDate)?.push(habit.STATUS);
    }

    // Count days where all habits were completed
    let completedDays = 0;
    habitsByDate.forEach((statuses) => {
      if (statuses.every((status) => status)) {
        completedDays++;
      }
    });

    return completedDays;
  }

  private calculateDaysLeft(endDate: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  }
  async getAvailableQuests(
    userId: number,
    filterType: QuestFilterType = QuestFilterType.ALL,
  ) {
    const allQuests = await this.getAllQuests();
    const userQuests = await this.getUserQuests(userId);

    const activeQuestIds = userQuests
      .filter((uq) => !uq.STATUS)
      .map((uq) => uq.QID);

    if (filterType == QuestFilterType.DOING) {
      return userQuests;
    }

    return allQuests.map((quest) => ({
      ...quest,
      isActive: activeQuestIds.includes(quest.QID),
    }));
  }

  async joinQuest(joinQuestDto: JoinQuestDto) {
    const { UID, QID } = joinQuestDto;

    // Check if quest exists
    const quest = await this.questRepository.findOne({
      where: { QID },
    });
    if (!quest) {
      throw new NotFoundException('Quest not found');
    }

    // Check if user already joined this quest
    const existingUserQuest = await this.userQuestRepository.findOne({
      where: { UID, QID, STATUS: false },
    });
    if (existingUserQuest) {
      throw new Error('User already joined this quest');
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + quest.QUEST_DAY_DURATION);

    const userJoinQuest = this.userQuestRepository.create({
      UID,
      QID,
      START_DATE: startDate,
      END_DATE: endDate,
      STATUS: false,
    });

    return this.userQuestRepository.save(userJoinQuest);
  }

  async checkQuestProgress(userId: number, habitCompletion: any) {
    const activeQuests = await this.userQuestRepository.find({
      where: {
        UID: userId,
        STATUS: false,
        END_DATE: Between(new Date(), new Date()),
      },
      relations: ['quest'],
    });

    for (const userQuest of activeQuests) {
      const quest = userQuest.quest;
      let isCompleted = false;

      switch (quest.QUEST_TYPE) {
        // Exercise quests
        case QUEST_TYPE.EXERCISE_DURATION:
          isCompleted =
            habitCompletion.totalExerciseMinutes >=
            quest.RQ_ACTIVITY_TARGET_TIME;
          break;
        case QUEST_TYPE.EXERCISE_STREAK:
          isCompleted =
            habitCompletion.exerciseStreakCount >= quest.RQ_SUCCESS_HABIT;
          break;
        case QUEST_TYPE.EXERCISE_SESSIONS:
          isCompleted =
            habitCompletion.exerciseSessionCount >= quest.RQ_SUCCESS_HABIT;
          break;

        // Diet quests
        case QUEST_TYPE.DIET_STREAK:
          isCompleted =
            habitCompletion.dietStreakCount >= quest.RQ_SUCCESS_HABIT;
          break;
        case QUEST_TYPE.DIET_SESSIONS:
          isCompleted =
            habitCompletion.dietSessionCount >= quest.RQ_SUCCESS_HABIT;
          break;
        case QUEST_TYPE.WATER_INTAKE:
          isCompleted = habitCompletion.waterGlasses >= quest.RQ_SUCCESS_HABIT;
          break;

        // Sleep quests
        case QUEST_TYPE.SLEEP_DURATION:
          isCompleted =
            habitCompletion.sleepHours >= quest.RQ_ACTIVITY_TARGET_TIME;
          break;
        case QUEST_TYPE.SLEEP_STREAK:
          isCompleted =
            habitCompletion.sleepStreakCount >= quest.RQ_SUCCESS_HABIT;
          break;
        case QUEST_TYPE.SLEEP_QUALITY:
          isCompleted =
            habitCompletion.goodSleepCount >= quest.RQ_SUCCESS_HABIT;
          break;

        // Combined quests
        case QUEST_TYPE.DAILY_ALL:
          isCompleted = habitCompletion.allHabitsCompleted;
          break;
        case QUEST_TYPE.WEEKLY_GOAL:
          isCompleted = habitCompletion.weeklyGoalAchieved;
          break;
      }

      if (isCompleted) {
        await this.completeQuest(userId, userQuest);
      }
    }
  }

  private async completeQuest(userId: number, userQuest: UserQuestEntity) {
    // Update quest status
    userQuest.STATUS = true;
    await this.userQuestRepository.save(userQuest);

    // Update user rewards
    const user = await this.userRepository.findOne({
      where: { UID: userId },
    });
    if (user) {
      user.GEM += userQuest.quest.GEM_REWARDS;
      user.EXP += userQuest.quest.EXP_REWARDS;
      await this.userRepository.save(user);
    }
  }
}
