import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between, LessThanOrEqual } from 'typeorm';
import { QuestService } from '../quest/quest.service';
import { HABIT_TYPE, HabitEntity } from '../.typeorm/entities/habit.entity';
import { UserHabitTrackEntity } from '../.typeorm/entities/user-habit-track.entity';
import {
  CompleteHabitDto,
  HabitFilterType,
  StartHabitDto,
} from './dto/habit.dto';
import { UsersService } from 'src/users/services/users.service';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitService {
  constructor(
    @InjectRepository(HabitEntity)
    private habitRepository: Repository<HabitEntity>,
    @InjectRepository(UserHabitTrackEntity)
    private userHabitTrackRepository: Repository<UserHabitTrackEntity>,
    private questService: QuestService,
    private userService: UsersService,
  ) {}

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ habits: HabitEntity[]; total: number }> {
    try {
      const [habits, total] = await this.habitRepository.findAndCount({
        skip: (page - 1) * limit,
        take: limit,
        order: { createAt: 'DESC' },
      });

      return {
        habits: habits,
        total: total,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
    }
  }

  async createHabit(createHabitDto: CreateHabitDto): Promise<HabitEntity> {
    try {
      const existingHabit = await this.habitRepository.findOne({
        where: { HABIT_TITLE: createHabitDto.HABIT_TITLE },
      });

      if (existingHabit) {
        throw new BadRequestException('Habit with this title already exists');
      }

      const habit = this.habitRepository.create(createHabitDto);
      return await this.habitRepository.save(habit);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to create habit: ${error.message}`,
      );
    }
  }

  async updateHabit(
    habitId: number,
    updateHabitDto: UpdateHabitDto,
  ): Promise<HabitEntity> {
    try {
      const habit = await this.habitRepository.findOne({
        where: { HID: habitId },
      });

      if (!habit) {
        throw new NotFoundException(`Habit with HID:${habitId} not found`);
      }

      const activeUsers = await this.userHabitTrackRepository.count({
        where: {
          HID: habitId,
          END_DATE: MoreThanOrEqual(new Date()),
        },
      });

      if (activeUsers > 0) {
        throw new BadRequestException('Cannot update habit with active users');
      }

      // If updating title, check for duplicates
      if (
        updateHabitDto.HABIT_TITLE &&
        updateHabitDto.HABIT_TITLE !== habit.HABIT_TITLE
      ) {
        const existingHabit = await this.habitRepository.findOne({
          where: {
            HABIT_TITLE: updateHabitDto.HABIT_TITLE,
          },
        });

        if (existingHabit) {
          throw new BadRequestException('Habit with this title already exists');
        }
      }

      Object.assign(habit, updateHabitDto);
      return await this.habitRepository.save(habit);
    } catch (error) {}
  }

  async getAvailableHabits(
    userId: number,
    medicalConditions: {
      diabetes: boolean;
      obesity: boolean;
      dyslipidemia: boolean;
      hypertension: boolean;
    },
    filterType: HabitFilterType = HabitFilterType.ALL,
  ) {
    try {
      // Get all habits
      const habits = await this.habitRepository.find();

      // Get user's active habits
      const activeHabitTracks = await this.userHabitTrackRepository.find({
        where: {
          UID: userId,
          END_DATE: MoreThanOrEqual(new Date()),
        },
        relations: ['habit'],
      });

      // Get the HIDs of active habits
      const activeHabitIds = activeHabitTracks.map((track) => track.HID);

      // Filter habits based on medical conditions and add active status
      const availableHabits = habits
        .filter((habit) => {
          // Filter out habits that are contraindicated by medical conditions
          if (medicalConditions.diabetes && habit.DIABETES_CONDITION)
            return false;
          if (medicalConditions.obesity && habit.OBESITY_CONDITION)
            return false;
          if (medicalConditions.dyslipidemia && habit.DYSLIPIDEMIA_CONDITION)
            return false;
          if (medicalConditions.hypertension && habit.HYPERTENSION_CONDITION)
            return false;

          return true;
        })
        .map((habit) => {
          const activeTrack = activeHabitTracks.find(
            (track) => track.HID === habit.HID,
          );
          return {
            ...habit,
            isActive: activeHabitIds.includes(habit.HID),
            currentStreak: activeTrack?.STREAK_COUNT || 0,
            startDate: activeTrack?.START_DATE || null,
            endDate: activeTrack?.END_DATE || null,
            timeGoal: activeTrack?.USER_TIME_GOAL || null,
            daysGoal: activeTrack?.USER_DAYS_GOAL || null,
            reminderTime: activeTrack?.REMINDER_NOTI_TIME || null,
          };
        });

      // Apply filter if specified
      if (filterType === HabitFilterType.DOING) {
        return availableHabits.filter((habit) => habit.isActive);
      }

      return availableHabits;
    } catch (error) {
      throw new Error(`Failed to get available habits: ${error.message}`);
    }
  }

  async getUserActiveHabits(userId: number) {
    try {
      const activeHabitTracks = await this.userHabitTrackRepository.find({
        where: {
          UID: userId,
          END_DATE: MoreThanOrEqual(new Date()),
        },
        relations: ['habit'],
        order: {
          START_DATE: 'DESC',
        },
      });

      const habits = await Promise.all(
        activeHabitTracks.map(async (track) => ({
          ...track.habit,
          currentStreak: track.STREAK_COUNT,
          startDate: track.START_DATE,
          endDate: track.END_DATE,
          timeGoal: track.USER_TIME_GOAL,
          daysGoal: track.USER_DAYS_GOAL,
          reminderTime: track.REMINDER_NOTI_TIME,
          progress: await this.calculateHabitProgress(
            userId,
            track.HID,
            track.START_DATE,
            track.END_DATE,
          ),
        })),
      );

      return { activeHabits: habits };
    } catch (error) {
      throw new Error(`Failed to get user active habits: ${error.message}`);
    }
  }

  private async calculateHabitProgress(
    userId: number,
    habitId: number,
    startDate: Date,
    endDate: Date,
  ) {
    const totalDays = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const completedDays = await this.userHabitTrackRepository.count({
      where: {
        UID: userId,
        HID: habitId,
        TRACK_DATE: Between(startDate, endDate),
        STATUS: true,
      },
    });

    return {
      completedDays,
      totalDays,
      percentage: Math.round((completedDays / totalDays) * 100),
    };
  }
  async startHabit(startHabitDto: StartHabitDto) {
    const { UID, HID, USER_TIME_GOAL, USER_DAYS_GOAL, REMINDER_NOTI_TIME } =
      startHabitDto;

    // Check if habit exists
    const habit = await this.habitRepository.findOne({
      where: { HID },
    });
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    // Check if user already has an active track for this habit
    const activeTrack = await this.userHabitTrackRepository.findOne({
      where: {
        UID,
        HID,
        END_DATE: MoreThanOrEqual(new Date()),
      },
    });
    if (activeTrack) {
      throw new BadRequestException(
        'User already has an active track for this habit',
      );
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + USER_DAYS_GOAL);

    const userHabitTrack = this.userHabitTrackRepository.create({
      UID,
      HID,
      TRACK_DATE: startDate,
      START_DATE: startDate,
      END_DATE: endDate,
      STATUS: false,
      TIME_USED: 0,
      USER_TIME_GOAL,
      USER_DAYS_GOAL,
      REMINDER_NOTI_TIME,
      STREAK_COUNT: 0,
    });

    return this.userHabitTrackRepository.save(userHabitTrack);
  }

  async completeHabit(completeHabitDto: CompleteHabitDto) {
    const { UID, HID, TIME_USED, MOOD_FEEDBACK } = completeHabitDto;

    const today = new Date();
    // today.setHours(0, 0, 0, 0);

    const habitTrack = await this.userHabitTrackRepository.findOne({
      where: {
        UID,
        HID,
        TRACK_DATE: LessThanOrEqual(today), // Track has started
        END_DATE: MoreThanOrEqual(today), // Track hasn't ended
      },
      relations: ['habit'],
    });

    if (!habitTrack) {
      throw new NotFoundException('Active habit track not found');
    }

    // // Check if already completed today
    // const todayCompletion = await this.userHabitTrackRepository.findOne({
    //   where: {
    //     UID,
    //     HID,
    //     TRACK_DATE: today,
    //     STATUS: true,
    //   },
    // });

    // if (todayCompletion) {
    //   throw new BadRequestException('Habit already completed for today');
    // }

    // For exercise habits, check if time goal is met
    if (habitTrack.habit.HABIT_TYPE === HABIT_TYPE.EXERCISE) {
      // if (!TIME_USED || TIME_USED < habitTrack.USER_TIME_GOAL) {
      //   throw new BadRequestException('Exercise time goal not met');
      // }
      habitTrack.TIME_USED = TIME_USED;
    }

    // Update streak count
    const yesterdayTrack = await this.userHabitTrackRepository.findOne({
      where: {
        UID,
        HID,
        TRACK_DATE: new Date(today.getTime() - 24 * 60 * 60 * 1000),
        STATUS: true,
      },
    });

    if (yesterdayTrack) {
      habitTrack.STREAK_COUNT = yesterdayTrack.STREAK_COUNT + 1;
    } else {
      habitTrack.STREAK_COUNT = 1;
    }

    // Update status and mood
    habitTrack.STATUS = true;
    if (MOOD_FEEDBACK) {
      habitTrack.MOOD_FEEDBACK = MOOD_FEEDBACK;
    }

    // Save the updated track
    await this.userHabitTrackRepository.save(habitTrack);

    // Check if habit period is complete
    if (habitTrack.END_DATE.getTime() === today.getTime()) {
      await this.processHabitCompletion(UID, habitTrack);
    }

    // Update quest progress
    const habitCompletion = {
      totalExerciseMinutes: TIME_USED,
      exerciseStreakCount: habitTrack.STREAK_COUNT,
      exerciseSessionCount: 1,
      dietStreakCount:
        habitTrack.habit.HABIT_TYPE === HABIT_TYPE.DIET
          ? habitTrack.STREAK_COUNT
          : 0,
      sleepStreakCount:
        habitTrack.habit.HABIT_TYPE === HABIT_TYPE.SLEEP
          ? habitTrack.STREAK_COUNT
          : 0,
    };

    await this.questService.checkQuestProgress(UID, habitCompletion);

    return habitTrack;
  }

  private async processHabitCompletion(
    userId: number,
    habitTrack: UserHabitTrackEntity,
  ) {
    // Calculate completion percentage
    const totalDays = Math.ceil(
      (habitTrack.END_DATE.getTime() - habitTrack.START_DATE.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const completedDays = await this.userHabitTrackRepository.count({
      where: {
        UID: userId,
        HID: habitTrack.HID,
        START_DATE: habitTrack.START_DATE,
        END_DATE: habitTrack.END_DATE,
        STATUS: true,
      },
    });

    const completionPercentage = (completedDays / totalDays) * 100;

    // Calculate rewards based on completion percentage
    const baseExpReward = habitTrack.habit.EXP_REWARD;
    const baseGemReward = habitTrack.habit.GEM_REWARD;

    const expReward = Math.floor((baseExpReward * completionPercentage) / 100);
    const gemReward = Math.floor((baseGemReward * completionPercentage) / 100);

    // Update user's rewards (assuming you have a user service or repository)
    // This should be implemented based on your user management system
    await this.updateUserRewards(userId, expReward, gemReward);

    return {
      completionPercentage,
      expReward,
      gemReward,
    };
  }

  private async updateUserRewards(userId: number, exp: number, gems: number) {
    // Implement user reward update logic

    // Get current user data
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Add new rewards to existing values
    const updatedRewardData: UpdateUserDto = {
      EXP: user.EXP + exp,
      GEM: user.GEM + gems,
    };

    const updatedUser = await this.userService.update(
      userId,
      updatedRewardData,
    );

    return updatedUser;
  }

  // async getUserHabitStats(userId: number, habitId: number) {
  //   const completedTracks = await this.userHabitTrackRepository.find({
  //     where: {
  //       UID: userId,
  //       HID: habitId,
  //       STATUS: true,
  //     },
  //     order: {
  //       TRACK_DATE: 'DESC',
  //     },
  //     relations: ['habit'],
  //   });

  //   return {
  //     totalCompletions: completedTracks.length,
  //     dayGoal: completedTracks[0]?.USER_DAYS_GOAL || null,
  //     currentStreak: completedTracks[0]?.STREAK_COUNT || 0,
  //     bestStreak: Math.max(
  //       ...completedTracks.map((track) => track.STREAK_COUNT),
  //       0,
  //     ),
  //     moodDistribution: this.calculateMoodDistribution(completedTracks),
  //     averageTimeUsed: this.calculateAverageTimeUsed(completedTracks),
  //     completionPercentage: (
  //       completedTracks.length / completedTracks[0].USER_DAYS_GOAL
  //     ).toFixed(2),
  //     habit: completedTracks[0]?.habit || null,
  //   };
  // }

  // private calculateMoodDistribution(tracks: UserHabitTrackEntity[]) {
  //   const distribution = {};
  //   tracks.forEach((track) => {
  //     if (track.MOOD_FEEDBACK) {
  //       distribution[track.MOOD_FEEDBACK] =
  //         (distribution[track.MOOD_FEEDBACK] || 0) + 1;
  //     }
  //   });
  //   return distribution;
  // }

  // private calculateAverageTimeUsed(tracks: UserHabitTrackEntity[]) {
  //   if (tracks.length === 0) return 0;
  //   const totalTime = tracks.reduce((sum, track) => sum + track.TIME_USED, 0);
  //   return totalTime / tracks.length;
  // }

  async getUserActiveHabitDetail(userId: number, habitId: number) {
    try {
      // Get active habit track
      const activeHabit = await this.userHabitTrackRepository.findOne({
        where: {
          UID: userId,
          HID: habitId,
          END_DATE: MoreThanOrEqual(new Date()),
        },
        relations: ['habit'],
      });

      if (!activeHabit) {
        throw new NotFoundException('Active habit not found');
      }

      // Get all completion records for this habit period
      const completionRecords = await this.userHabitTrackRepository.find({
        where: {
          UID: userId,
          HID: habitId,
          TRACK_DATE: Between(activeHabit.START_DATE, activeHabit.END_DATE),
        },
        order: {
          TRACK_DATE: 'ASC',
        },
      });

      // Calculate days since start
      const startDate = new Date(activeHabit.START_DATE);
      const today = new Date();
      const daysSinceStart = Math.floor(
        (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      // Generate daily status array
      const dailyStatus = [];
      for (let i = 0; i <= daysSinceStart; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        const dateStr = currentDate.toISOString().split('T')[0];

        const completion = completionRecords.find(
          (record) => record.TRACK_DATE.toISOString().split('T')[0] === dateStr,
        );

        dailyStatus.push({
          date: dateStr,
          isCompleted: !!completion,
          timeUsed: completion?.TIME_USED || 0,
          mood: completion?.MOOD_FEEDBACK || null,
        });
      }

      // Calculate statistics
      const completedDays = completionRecords.length;
      const totalPossibleDays = daysSinceStart + 1;
      const remainingDays = activeHabit.USER_DAYS_GOAL - daysSinceStart - 1;

      // Calculate average time used (for exercise habits)
      const avgTimeUsed =
        activeHabit.habit.HABIT_TYPE === 'exercise' && completedDays > 0
          ? completionRecords.reduce(
              (sum, record) => sum + (record.TIME_USED || 0),
              0,
            ) / completedDays
          : null;

      // Calculate completion rate needed for remaining days to meet goal
      const targetCompletionRate =
        remainingDays > 0
          ? Math.ceil(
              ((activeHabit.USER_DAYS_GOAL - completedDays) / remainingDays) *
                100,
            )
          : 0;

      // Get mood distribution
      const moodDistribution = completionRecords.reduce((acc, record) => {
        if (record.MOOD_FEEDBACK) {
          acc[record.MOOD_FEEDBACK] = (acc[record.MOOD_FEEDBACK] || 0) + 1;
        }
        return acc;
      }, {});

      return {
        habitInfo: {
          ...activeHabit.habit,
          currentStreak: activeHabit.STREAK_COUNT,
        },
        trackingPeriod: {
          startDate: activeHabit.START_DATE,
          endDate: activeHabit.END_DATE,
          daysGoal: activeHabit.USER_DAYS_GOAL,
          timeGoal: activeHabit.USER_TIME_GOAL,
          reminderTime: activeHabit.REMINDER_NOTI_TIME,
        },
        progress: {
          completedDays,
          totalPossibleDays,
          remainingDays,
          completionRate: Math.round((completedDays / totalPossibleDays) * 100),
          targetCompletionRate,
          avgTimeUsed,
          bestStreak: Math.max(
            ...completionRecords.map((r) => r.STREAK_COUNT),
            0,
          ),
        },
        statistics: {
          moodDistribution,
          consistencyRate: Math.round(
            (completedDays / totalPossibleDays) * 100,
          ),
          completionTrend: this.calculateCompletionTrend(dailyStatus),
        },
        dailyStatus,
        nextMilestone: this.calculateNextMilestone(activeHabit),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to get habit detail: ${error.message}`,
      );
    }
  }

  private calculateCompletionTrend(dailyStatus: any[]): string {
    if (dailyStatus.length < 2) return 'NOT_ENOUGH_DATA';

    const lastThreeDays = dailyStatus.slice(-3);
    const completedCount = lastThreeDays.filter(
      (day) => day.isCompleted,
    ).length;

    if (completedCount === 3) return 'STRONG';
    if (completedCount === 2) return 'GOOD';
    if (completedCount === 1) return 'NEEDS_IMPROVEMENT';
    return 'AT_RISK';
  }

  private calculateNextMilestone(habitTrack: UserHabitTrackEntity): any {
    const currentStreak = habitTrack.STREAK_COUNT;
    const milestones = [3, 5, 7, 14, 21, 30, 60, 90];

    const nextMilestone =
      milestones.find((m) => m > currentStreak) ||
      milestones[milestones.length - 1];

    return {
      current: currentStreak,
      next: nextMilestone,
      remaining: nextMilestone - currentStreak,
    };
  }
}
