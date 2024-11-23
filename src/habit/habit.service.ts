import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, Between } from 'typeorm';
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

      return activeHabitTracks.map(async (track) => ({
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
      }));
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
    today.setHours(0, 0, 0, 0);

    const habitTrack = await this.userHabitTrackRepository.findOne({
      where: {
        UID,
        HID,
        TRACK_DATE: today,
        END_DATE: MoreThanOrEqual(today),
      },
      relations: ['habit'],
    });

    if (!habitTrack) {
      throw new NotFoundException('Active habit track not found');
    }

    // For exercise habits, check if time goal is met
    if (habitTrack.habit.HABIT_TYPE === HABIT_TYPE.EXERCISE) {
      if (!TIME_USED || TIME_USED < habitTrack.USER_TIME_GOAL) {
        throw new BadRequestException('Exercise time goal not met');
      }
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
    // This should update the USER table's EXP and GEM columns

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

  async getUserHabitStats(userId: number, habitId: number) {
    const completedTracks = await this.userHabitTrackRepository.find({
      where: {
        UID: userId,
        HID: habitId,
        STATUS: true,
      },
      order: {
        TRACK_DATE: 'DESC',
      },
    });

    return {
      totalCompletions: completedTracks.length,
      currentStreak: completedTracks[0]?.STREAK_COUNT || 0,
      bestStreak: Math.max(
        ...completedTracks.map((track) => track.STREAK_COUNT),
        0,
      ),
      moodDistribution: this.calculateMoodDistribution(completedTracks),
      averageTimeUsed: this.calculateAverageTimeUsed(completedTracks),
    };
  }

  private calculateMoodDistribution(tracks: UserHabitTrackEntity[]) {
    const distribution = {};
    tracks.forEach((track) => {
      if (track.MOOD_FEEDBACK) {
        distribution[track.MOOD_FEEDBACK] =
          (distribution[track.MOOD_FEEDBACK] || 0) + 1;
      }
    });
    return distribution;
  }

  private calculateAverageTimeUsed(tracks: UserHabitTrackEntity[]) {
    if (tracks.length === 0) return 0;
    const totalTime = tracks.reduce((sum, track) => sum + track.TIME_USED, 0);
    return totalTime / tracks.length;
  }
}
