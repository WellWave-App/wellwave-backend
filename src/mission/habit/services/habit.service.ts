import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { ImageService } from '../../../image/image.service';
import {
  ExerciseType,
  HabitCategories,
  Habits,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { HabitStatus } from '@/.typeorm/entities/user-habits.entity';
import { StartHabitChallengeDto } from '../dto/user-habit.dto';
import { TrackHabitDto, UpdateDailyTrackDto } from '../dto/track-habit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import {
  DailyHabitTrack,
  Moods,
} from '@/.typeorm/entities/daily-habit-track.entity';
import { HabitListFilter } from '../interfaces/habits.interfaces';
import { QuestService } from '../../quest/services/quest.service';
import { updateHabitNotiDto } from '../dto/noti-update.dto';
import { LogsService } from '@/user-logs/services/logs.service';
import { DateService } from '@/helpers/date/date.services';
import { LOG_NAME, LogEntity } from '@/.typeorm/entities/logs.entity';
import { UsersService } from '@/users/services/users.service';
import { HabitRecommendService } from '@/recommendation/services/habits-recommendation.service';
import { User, USER_GOAL } from '@/.typeorm/entities/users.entity';
import { UserHabits } from '../../../.typeorm/entities/user-habits.entity';
import {
  RiskCalculator,
  RiskLevel,
} from '@/recommendation/utils/risk-calculator.util';
import {
  QuestStatus,
  UserQuests,
} from '@/.typeorm/entities/user-quests.entity';
import { CreateLogDto } from '@/user-logs/dto/create-log.dto';
import { RewardService } from '@/users/services/reward.service';
import { AchievementService } from '@/achievement/services/achievement.service';
import {
  RequirementEntity,
  TrackableProperty,
} from '@/.typeorm/entities/achievement.entity';
import { PaginationDto } from '../dto/admin-summary.dto';
import { Quest } from '@/.typeorm/entities/quest.entity';

export interface StatisticsQueryParams {
  page: number;
  limit: number;
  category?: HabitCategories;
  search?: string;
}

export interface StatisticsResponseMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StatisticsResponse {
  data: any[];
  meta: StatisticsResponseMeta;
}

export enum ItemType {
  QUEST = 'เควส',
  HABIT = 'ภารกิจปรับนิสัย',
  DAILY_HABIT = 'ภารกิจประจำวัน',
}

@Injectable()
export class HabitService {
  constructor(
    @InjectRepository(Habits)
    private habitsRepository: Repository<Habits>,
    @InjectRepository(UserHabits)
    private userHabitsRepository: Repository<UserHabits>,
    @InjectRepository(DailyHabitTrack)
    private dailyTrackRepository: Repository<DailyHabitTrack>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserQuests)
    private userQuestRepository: Repository<UserQuests>,
    @InjectRepository(LogEntity)
    private logsRepository: Repository<LogEntity>,
    @InjectRepository(Quest)
    private questsRepository: Repository<Quest>,
    private readonly imageService: ImageService,
    private readonly questService: QuestService,
    private readonly logService: LogsService,
    private readonly userService: UsersService,
    private readonly dateService: DateService,
    private readonly rewardService: RewardService,
    private readonly achievementService: AchievementService,
  ) {}

  async createHabit(
    createHabitDto: CreateHabitDto,
    file?: Express.Multer.File,
  ): Promise<Habits> {
    if (file) {
      createHabitDto.THUMBNAIL_URL = this.imageService.getImageUrl(
        file.filename,
      );
    }

    const habit = this.habitsRepository.create(createHabitDto);

    return await this.habitsRepository.save(habit);
  }

  async getDailyHabit(uid: number): Promise<PaginatedResponse<any>> {
    // * updated outdate daily habit
    await this.updateOutdatedHabits(uid);

    const today = new Date(this.dateService.getCurrentDate().date);
    today.setHours(0, 0, 0, 0);

    // * helper format function
    const formatResponse = (h: UserHabits) => ({
      CHALLENGE_ID: h.CHALLENGE_ID,
      HID: h.HID,
      TITLE: h.habits?.TITLE,
      THUMBNAIL_URL: h.habits?.THUMBNAIL_URL,
      EXP_REWARD: h.habits?.EXP_REWARD,
    });

    const userDailyHabits = await this.getUserHabits(
      uid,
      HabitStatus.Active,
      false,
      null,
      null,
      true,
    );

    const filterTodayDailyHabits = userDailyHabits.data.filter((uh) => {
      const startDate = new Date(uh.START_DATE);
      return uh.habits.IS_DAILY && this.dateService.isSameDay(startDate, today);
    });

    if (filterTodayDailyHabits.length > 0) {
      const formatted = filterTodayDailyHabits.map((uh) => formatResponse(uh));
      return {
        data: formatted,
        meta: { total: filterTodayDailyHabits.length },
      };
    }

    const randomHabits = await this.habitsRepository
      .createQueryBuilder('habits')
      .where('habits.IS_DAILY = true')
      .orderBy('RANDOM()')
      .limit(4)
      .getMany();

    await Promise.all(
      randomHabits.map((h) =>
        this.startChallenge(uid, { UID: uid, HID: h.HID, DAYS_GOAL: 1 }),
      ),
    );

    const uhToday = await this.userHabitsRepository.find({
      where: {
        UID: uid,
        habits: { IS_DAILY: true },
        START_DATE: today,
        // END_DATE: new Date(today.getDate() + 1),
      },
    });

    const formatted = uhToday.map((uh) => formatResponse(uh));
    return {
      data: formatted,
      meta: { total: formatted.length },
    };
  }

  async updateOutdatedHabits(uid: number): Promise<void> {
    const today = new Date(this.dateService.getCurrentDate().date);
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Find all active habits for the user
    const userHabits = await this.userHabitsRepository
      .createQueryBuilder('uh')
      .leftJoinAndSelect('uh.habits', 'habits')
      .where('uh.UID = :uid', { uid })
      .andWhere('uh.STATUS = :status', { status: HabitStatus.Active })
      .getMany();

    // Filter out habits that were started today
    const outdatedHabits = userHabits.filter((habit) => {
      const endDate = new Date(habit.END_DATE);
      endDate.setHours(0, 0, 0, 0);
      return endDate <= today;
    });

    if (outdatedHabits.length === 0) {
      return;
    }

    // Update status of outdated habits to calcled
    await this.userHabitsRepository
      .createQueryBuilder()
      .update()
      .set({
        STATUS: HabitStatus.Failed,
      })
      .whereInIds(outdatedHabits.map((habit) => habit.CHALLENGE_ID))
      .execute();
  }

  async getHabits(
    userId: number,
    filter: HabitListFilter = HabitListFilter.ALL,
    category?: HabitCategories | 'rec',
    page: number = 1,
    limit: number = 10,
    pagination: boolean = false,
  ): Promise<PaginatedResponse<any>> {
    // Start with habits query
    await this.updateOutdatedHabits(userId);

    const habitsQuery = this.habitsRepository
      .createQueryBuilder('habit')
      .where('habit.IS_DAILY = false');
    const activeHabits = await this.userHabitsRepository
      .createQueryBuilder('userHabit')
      .where('userHabit.UID = :userId', { userId })
      .andWhere('userHabit.STATUS = :status', { status: HabitStatus.Active })
      .getMany();

    const activeHabitIds = new Set(activeHabits.map((h) => h.HID));
    let filteredHabits;
    let recommendationScores = new Map();
    let allHabits = await habitsQuery.getMany();

    if (category === 'rec') {
      const user = await this.userRepository.findOne({
        where: { UID: userId },
        relations: ['RiskAssessment', 'habits'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const allUsers = await this.userRepository.find({
        relations: ['RiskAssessment', 'habits'],
      });

      const recommendations = await HabitRecommendService.recommendHabits(
        allHabits.filter((habit) => !activeHabitIds.has(habit.HID)),
        user,
        allUsers,
        limit || 5,
      );

      // Store scores for later use
      recommendationScores = new Map(
        recommendations.map((rec) => [rec.habit.HID, rec.scoreInfo]),
      );

      // Extract just the habits for filtering
      filteredHabits = recommendations.map((rec) => rec.habit);
    } else {
      if (category) {
        habitsQuery.andWhere('habit.CATEGORY = :category', { category });
        allHabits = await habitsQuery.getMany();
      }
    }

    switch (filter) {
      case HabitListFilter.DOING:
        filteredHabits = allHabits.filter((habit) =>
          activeHabitIds.has(habit.HID),
        );
        break;
      case HabitListFilter.NOT_DOING:
        filteredHabits = allHabits.filter(
          (habit) => !activeHabitIds.has(habit.HID),
        );
        break;
      default:
        filteredHabits = allHabits;
    }

    const total = filteredHabits.length;
    const totalPages = pagination ? Math.ceil(total / limit) : undefined;

    if (pagination) {
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      filteredHabits = filteredHabits.slice(startIndex, endIndex);
    }

    const mappedHabits = await Promise.all(
      filteredHabits.map(async (habit) => {
        const isActive = activeHabitIds.has(habit.HID);

        let challengeInfo = null;
        if (isActive) {
          const activeChallenge = await this.userHabitsRepository.findOne({
            where: {
              UID: userId,
              HID: habit.HID,
              STATUS: HabitStatus.Active,
            },
            relations: ['dailyTracks'],
          });

          if (activeChallenge) {
            const daysCompleted = activeChallenge.dailyTracks.filter(
              (track) => track.COMPLETED,
            ).length;

            challengeInfo = {
              challengeId: activeChallenge.CHALLENGE_ID,
              startDate: activeChallenge.START_DATE,
              endDate: activeChallenge.END_DATE,
              streakCount: activeChallenge.STREAK_COUNT,
              daysCompleted: daysCompleted,
              totalDays: activeChallenge.DAYS_GOAL,
              percentageProgress: Number(
                ((daysCompleted / activeChallenge.DAYS_GOAL) * 100).toFixed(2),
              ),
            };
          }
        }

        // Get scoreInfo from recommendationScores if available, else null
        const scoreInfo = recommendationScores.get(habit.HID) || null;

        return {
          ...habit,
          isActive,
          challengeInfo,
          scoreInfo,
        };
      }),
    );

    return {
      data: mappedHabits.sort((a, b) => {
        if (b.scoreInfo !== null && a.scoreInfo !== null) {
          return b.scoreInfo.score - a.scoreInfo.score;
        } else {
          // if (a.isActive && !b.isActive) return -1;
          // if (!a.isActive && b.isActive) return 1;
          // return 0;
        }
      }),
      meta: {
        total,
        ...(pagination && {
          page,
          limit,
          totalPages,
          pagination,
        }),
      },
    };
  }

  // Helper method to calculate match score
  private async calculateMatchScore(
    habit: Habits,
    userId: number,
  ): Promise<number> {
    const user = await this.userRepository.findOne({
      where: { UID: userId },
      relations: ['RiskAssessment'],
    });

    if (!user || !user.RiskAssessment) {
      return 0.7; // Default score if no risk assessment
    }

    // Calculate individual scores
    const riskScore = HabitRecommendService['calculateRiskScore'](
      habit,
      user.RiskAssessment,
    );
    const goalScore = HabitRecommendService['calculateGoalScore'](
      habit,
      user.USER_GOAL,
    );

    // Return weighted average
    return riskScore * 0.6 + goalScore * 0.4;
  }

  // Helper method to get recommendation reasons
  private async getRecommendationReasons(
    habit: Habits,
    userId: number,
  ): Promise<string[]> {
    const user = await this.userRepository.findOne({
      where: { UID: userId },
      relations: ['RiskAssessment'],
    });

    const reasons: string[] = [];

    // Add goal-based reason
    switch (user.USER_GOAL) {
      case USER_GOAL.BUILD_MUSCLE:
        if (
          habit.CATEGORY === HabitCategories.Exercise &&
          habit.EXERCISE_TYPE === ExerciseType.Strength
        ) {
          reasons.push('Aligns with your muscle building goal');
        }
        break;
      case USER_GOAL.LOSE_WEIGHT:
        if (
          habit.CATEGORY === HabitCategories.Exercise ||
          habit.CATEGORY === HabitCategories.Diet
        ) {
          reasons.push('Supports your weight loss journey');
        }
        break;
      case USER_GOAL.STAY_HEALTHY:
        reasons.push('Contributes to your overall health maintenance');
        break;
    }

    // Add risk-based reason
    if (user.RiskAssessment) {
      const riskLevel = RiskCalculator.calculateOverallRiskLevel({
        diabetes: user.RiskAssessment.DIABETES ?? 0,
        hypertension: user.RiskAssessment.HYPERTENSION ?? 0,
        dyslipidemia: user.RiskAssessment.DYSLIPIDEMIA ?? 0,
        obesity: user.RiskAssessment.OBESITY ?? 0,
      });

      if (riskLevel !== RiskLevel.LOW) {
        reasons.push('Suitable for your health profile');
      }
    }

    return reasons;
  }

  async startChallenge(
    userId: number,
    startDto: StartHabitChallengeDto,
  ): Promise<UserHabits> {
    const habit = await this.habitsRepository.findOne({
      where: { HID: startDto.HID },
    });

    if (!habit) {
      throw new NotFoundException(`Habit id ${startDto.HID} not found`);
    }

    // Check if user has active challenge for this habit
    const activeChallenge = await this.userHabitsRepository.findOne({
      where: {
        UID: userId,
        HID: startDto.HID,
        STATUS: HabitStatus.Active,
      },
    });

    if (activeChallenge !== null) {
      throw new ConflictException(
        'Active challenge already exists for this habit',
      );
    }

    const userHabit = this.userHabitsRepository.create({
      UID: userId,
      HID: startDto.HID,
      START_DATE: new Date(this.dateService.getCurrentDate().date),
      STATUS: HabitStatus.Active,
      DAYS_GOAL: startDto.DAYS_GOAL || habit.DEFAULT_DAYS_GOAL,
      DAILY_MINUTE_GOAL:
        startDto.DAILY_MINUTE_GOAL || habit.DEFAULT_DAILY_MINUTE_GOAL,
      IS_NOTIFICATION_ENABLED: startDto.IS_NOTIFICATION_ENABLED || false,
      WEEKDAYS_NOTI: startDto.WEEKDAYS_NOTI || {
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
      },
      habits: { HID: startDto.HID },
      user: { UID: userId },
    });

    // Calculate end date
    const endDate = new Date(this.dateService.getCurrentDate().date);
    endDate.setDate(endDate.getDate() + userHabit.DAYS_GOAL);
    userHabit.END_DATE = endDate;

    return await this.userHabitsRepository.save(userHabit);
  }

  async trackHabit(
    userId: number,
    trackDto: TrackHabitDto,
  ): Promise<DailyHabitTrack> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: {
        CHALLENGE_ID: trackDto.CHALLENGE_ID,
        UID: userId,
      },
      relations: ['habits'],
    });
    const trackDate = trackDto.TRACK_DATE
      ? new Date(trackDto.TRACK_DATE)
      : new Date(this.dateService.getCurrentDate().date);

    if (!userHabit) {
      throw new NotFoundException('Challenge not found');
    }

    if (userHabit.STATUS !== HabitStatus.Active) {
      throw new BadRequestException('Challenge is not active');
    }

    if (trackDate > new Date(userHabit.END_DATE)) {
      throw new BadRequestException('Cannot track after challenge end date');
    }

    // Find or create daily track
    let dailyTrack = await this.dailyTrackRepository.findOne({
      where: {
        CHALLENGE_ID: trackDto.CHALLENGE_ID,
        TRACK_DATE: trackDate,
      },
      relations: ['UserHabits'],
    });

    if (!dailyTrack) {
      dailyTrack = this.dailyTrackRepository.create({
        CHALLENGE_ID: trackDto.CHALLENGE_ID,
        TRACK_DATE: trackDate,
      });
    }

    let trackingValue = 0;
    // Update tracking based on habit type
    switch (userHabit.habits.TRACKING_TYPE) {
      case TrackingType.Duration:
        if (!trackDto.DURATION_MINUTES) {
          throw new BadRequestException('Duration is required for this habit');
        }
        dailyTrack.DURATION_MINUTES = trackDto.DURATION_MINUTES;
        dailyTrack.COMPLETED =
          trackDto.DURATION_MINUTES >= userHabit.DAILY_MINUTE_GOAL;
        trackingValue = trackDto.DURATION_MINUTES || 0;
        break;

      case TrackingType.Distance:
        if (!trackDto.DISTANCE_KM) {
          throw new BadRequestException('Distance is required for this habit');
        }
        dailyTrack.DISTANCE_KM = trackDto.DISTANCE_KM;
        // TODO: Set completion criteria based on your requirements
        dailyTrack.COMPLETED = true;
        trackingValue = trackDto.DISTANCE_KM || 0;
        break;

      case TrackingType.Boolean: // for true/false habit (sleep/ diet)
        if (trackDto.COMPLETED === undefined) {
          throw new BadRequestException(
            'Completion status is required for this habit',
          );
        }
        dailyTrack.COMPLETED = trackDto.COMPLETED;
        trackingValue = trackDto.COMPLETED ? 1 : 0;
        break;

      case TrackingType.Count:
        if (!trackDto.COUNT_VALUE) {
          throw new BadRequestException('Count is required for this habit');
        }
        dailyTrack.COUNT_VALUE = trackDto.COUNT_VALUE;
        // TODO: Set completion criteria based on your requirements
        dailyTrack.COMPLETED = true;
        trackingValue = trackDto.COUNT_VALUE || 0;
        break;
    }

    // calculateMetrics, before saving dailyTrack
    if (userHabit.habits.EXERCISE_TYPE && trackDto.DURATION_MINUTES >= 0) {
      const user = await this.userService.getById(userId);
      if (user) {
        dailyTrack.calculateMetrics(user, userHabit.habits);
      }
    }
    dailyTrack.MOOD_FEEDBACK = trackDto.MOOD_FEEDBACK;

    const savedTrack = await this.dailyTrackRepository.save(dailyTrack);

    // * update related logs
    await this.updateRelatedLogs(userId, savedTrack);
    // * update realted quests
    await this.questService.updateQuestProgress(userId, {
      category: userHabit.habits.CATEGORY,
      exerciseType: userHabit.habits.EXERCISE_TYPE,
      trackingType: userHabit.habits.TRACKING_TYPE,
      value: trackingValue,
      date: new Date(trackDto.TRACK_DATE),
    });
    // * update related quests with calculated metrics (if available)
    if (savedTrack.STEPS_CALCULATED) {
      await this.questService.updateQuestProgress(userId, {
        category: userHabit.habits.CATEGORY,
        exerciseType: userHabit.habits.EXERCISE_TYPE,
        trackingType: TrackingType.Count,
        value: savedTrack.STEPS_CALCULATED,
        date: new Date(trackDto.TRACK_DATE),
      });
    }

    if (savedTrack.DISTANCE_KM) {
      await this.questService.updateQuestProgress(userId, {
        category: userHabit.habits.CATEGORY,
        exerciseType: userHabit.habits.EXERCISE_TYPE,
        trackingType: TrackingType.Distance,
        value: savedTrack.DISTANCE_KM,
        date: new Date(trackDto.TRACK_DATE),
      });
    }

    if (savedTrack.COMPLETED) {
      await this.rewardService.rewardUser(userId, {
        exp: userHabit.habits.EXP_REWARD,
      });
    }

    // * track achievement progress
    if (
      trackDto.DURATION_MINUTES &&
      userHabit.habits.CATEGORY === HabitCategories.Exercise
    ) {
      await this.achievementService.trackProgress({
        uid: userHabit.user.UID,
        entity: RequirementEntity.USER_HABIT_CHALLENGES,
        property: TrackableProperty.TOTAL_EXERCISE_MINUTE,
        value: trackDto.DURATION_MINUTES,
        date: new Date(this.dateService.getCurrentDate().timestamp),
      });
    }

    await this.achievementService.trackProgress({
      uid: userHabit.user.UID,
      entity: RequirementEntity.USER_HABIT_CHALLENGES,
      property: TrackableProperty.CONSECUTIVE_DAYS,
      value: 1,
      date: new Date(this.dateService.getCurrentDate().timestamp),
    });

    // *Update streak and check completion
    await this.updateStreakCount(userHabit.CHALLENGE_ID);
    await this.checkChallengeCompletion(userHabit.CHALLENGE_ID);

    return await this.dailyTrackRepository.findOne({
      where: {
        TRACK_ID: savedTrack.TRACK_ID,
      },
      relations: ['UserHabits'],
    });
  }

  async updateRelatedLogs(userId: number, dailyTrack: DailyHabitTrack) {
    const track = await this.dailyTrackRepository.findOne({
      where: {
        TRACK_ID: dailyTrack.TRACK_ID,
      },
      relations: ['UserHabits'],
    });

    if (!track) {
      throw new NotFoundException(`Not found trackId: ${dailyTrack.TRACK_ID}`);
    }

    // Only create/update logs if we have calculated values
    if (track.UserHabits?.habits?.EXERCISE_TYPE) {
      const trackDate = new Date(track.TRACK_DATE);

      // Handle steps log
      if (track.STEPS_CALCULATED) {
        await this.createOrUpdateLog({
          UID: userId,
          DATE: trackDate,
          LOG_NAME: LOG_NAME.STEP_LOG,
          VALUE: track.STEPS_CALCULATED,
        });
      }

      // Handle calories log
      if (track.CALORIES_BURNED) {
        await this.createOrUpdateLog({
          UID: userId,
          DATE: trackDate,
          LOG_NAME: LOG_NAME.CAL_BURN_LOG,
          VALUE: track.CALORIES_BURNED,
        });
      }

      // Handle heart rate log
      if (track.HEART_RATE) {
        await this.createOrUpdateLog({
          UID: userId,
          DATE: trackDate,
          LOG_NAME: LOG_NAME.HEART_RATE_LOG,
          VALUE: track.HEART_RATE,
        });
      }
    }
  }

  // New helper method to create or update logs
  async createOrUpdateLog(createLogDto: CreateLogDto): Promise<LogEntity> {
    const user = await this.userRepository.findOne({
      where: { UID: createLogDto.UID },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createLogDto.UID} not found`);
    }

    // Use raw query with ON CONFLICT to handle upsert
    const result = await this.logsRepository.query(
      `INSERT INTO "LOGS"("UID", "LOG_NAME", "DATE", "VALUE") 
       VALUES ($1, $2, $3, $4)
       ON CONFLICT("UID", "LOG_NAME", "DATE") 
       DO UPDATE SET "VALUE" = "LOGS"."VALUE" + $4
       RETURNING *`,
      [
        createLogDto.UID,
        createLogDto.LOG_NAME,
        createLogDto.DATE,
        createLogDto.VALUE,
      ],
    );

    return result[0];
  }

  private async updateStreakCount(challengeId: number): Promise<void> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: { CHALLENGE_ID: challengeId },
      relations: ['dailyTracks', 'habits'],
    });

    const sortedTracks = userHabit.dailyTracks.sort(
      (a, b) =>
        new Date(b.TRACK_DATE).getTime() - new Date(a.TRACK_DATE).getTime(),
    );

    let currentStreak = 0;
    for (const track of sortedTracks) {
      if (track.COMPLETED) {
        currentStreak++;
      } else {
        break;
      }
    }

    const oldStreak = userHabit.STREAK_COUNT;
    userHabit.STREAK_COUNT = currentStreak;
    await this.userHabitsRepository.save(userHabit);

    // Check if streak has increased and update streak-based quests
    if (currentStreak > oldStreak) {
      await this.questService.updateQuestProgress(userHabit.UID, {
        category: userHabit.habits.CATEGORY,
        exerciseType: userHabit.habits.EXERCISE_TYPE,
        trackingType: TrackingType.Count, // Streaks are counted
        value: currentStreak, // Pass the full streak value
        date: new Date(this.dateService.getCurrentDate().date),
        progressType: 'streak', // Add this to differentiate streak updates
      });
    }
  }

  private async checkChallengeCompletion(challengeId: number): Promise<void> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: { CHALLENGE_ID: challengeId },
      relations: ['dailyTracks', 'habits', 'user'],
    });

    const today = new Date(this.dateService.getCurrentDate().date);
    const completedDays = userHabit.dailyTracks.filter(
      (track) => track.COMPLETED,
    ).length;

    if (completedDays >= userHabit.DAYS_GOAL) {
      userHabit.STATUS = HabitStatus.Completed;

      await this.questService.updateQuestProgress(userHabit.UID, {
        category: userHabit.habits.CATEGORY,
        exerciseType: userHabit.habits.EXERCISE_TYPE,
        trackingType: TrackingType.Count,
        value: 1, // One completion
        date: new Date(this.dateService.getCurrentDate().date),
        progressType: 'completion',
      });
      // * update acheivement progress
      await Promise.all([
        this.achievementService.trackProgress({
          uid: userHabit.user.UID,
          entity: RequirementEntity.USER_MISSIONS,
          property: TrackableProperty.COMPLETED_MISSION,
          value: 1,
          date: new Date(this.dateService.getCurrentDate().timestamp),
        }),

        this.achievementService.trackProgress({
          uid: userHabit.user.UID,
          entity: RequirementEntity.USER_MISSIONS,
          property: TrackableProperty.COMPLETED_MISSION,
          value: 1,
          date: new Date(this.dateService.getCurrentDate().timestamp),
        }),
      ]);
    } else if (today >= new Date(userHabit.END_DATE)) {
      userHabit.STATUS = HabitStatus.Failed;
    }

    await this.userHabitsRepository.save(userHabit);
  }

  async getUserHabits(
    userId: number,
    status?: HabitStatus,
    pagination: boolean = false,
    page: number = 1,
    limit: number = 10,
    isDaily?: boolean,
    startDate?: string,
    endDate?: string,
  ): Promise<PaginatedResponse<UserHabits>> {
    const queryBuilder = this.userHabitsRepository
      .createQueryBuilder('userHabit')
      .leftJoinAndSelect('userHabit.habits', 'habit')
      .leftJoinAndSelect('userHabit.dailyTracks', 'tracks')
      .where('userHabit.UID = :userId', { userId });

    if (isDaily) {
      queryBuilder.andWhere('habit.IS_DAILY = :isDaily', { isDaily: isDaily });
    }

    if (status) {
      queryBuilder.andWhere('userHabit.STATUS = :status', { status });
    }

    if (startDate) {
      queryBuilder.andWhere('userHabit.START_DATE >= :startDate', {
        startDate,
      });
    }

    if (endDate) {
      queryBuilder.andWhere('userHabit.END_DATE <= :endDate', { endDate });
    }
    if (pagination) {
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      queryBuilder
        .skip((page - 1) * limit)
        .take(limit)
        .orderBy('userHabit.START_DATE', 'DESC'); // Add ordering for consistency
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data: data || [],
      meta: {
        total,
        ...(pagination && {
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 0,
          pagination,
        }),
      },
    };
  }

  async getHabitStats(userId: number, challengeId: number): Promise<any> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: {
        CHALLENGE_ID: challengeId,
        UID: userId,
      },
      relations: ['dailyTracks', 'habits'],
    });

    if (!userHabit) {
      throw new NotFoundException('Challenge not found');
    }

    const totalDays = userHabit.DAYS_GOAL;
    const completedDays = userHabit.dailyTracks.filter(
      (track) => track.COMPLETED,
    ).length;
    const currentStreak = userHabit.STREAK_COUNT;

    let totalValue = 0;
    switch (userHabit.habits.TRACKING_TYPE) {
      case TrackingType.Duration:
        totalValue = userHabit.dailyTracks.reduce(
          (sum, track) => sum + (track.DURATION_MINUTES || 0),
          0,
        );
        break;
      case TrackingType.Distance:
        totalValue = userHabit.dailyTracks.reduce(
          (sum, track) => sum + (track.DISTANCE_KM || 0),
          0,
        );
        break;
      case TrackingType.Count:
        totalValue = userHabit.dailyTracks.reduce(
          (sum, track) => sum + (track.COUNT_VALUE || 0),
          0,
        );
        break;
      // case TrackingType.Boolean:
      //   totalValue = userHabit.dailyTracks.reduce(
      //     (sum, track) => sum + (track.COMPLETED ? 1 : 0),
      //     0,
      //   );
      //   break;
    }

    return {
      totalDays,
      completedDays,
      currentStreak,
      totalValue,
      progressPercentage: Number(
        ((completedDays / totalDays) * 100).toFixed(2),
      ),
      status: userHabit.STATUS,
      dailyTracks: userHabit.dailyTracks,
    };
  }

  async updateUserHabitsNotification(uid: number, dto: updateHabitNotiDto) {
    const uh = await this.userHabitsRepository.findOne({
      where: {
        CHALLENGE_ID: dto.CHALLENGE_ID,
        UID: uid,
      },
    });

    if (!uh) {
      throw new NotFoundException('User habit not found');
    }

    await this.userHabitsRepository.update(uh.CHALLENGE_ID, {
      ...dto,
      NOTI_TIME: dto.NOTI_TIME
        ? this.convertTimeStringToDate(dto.NOTI_TIME)
        : null,
    });

    return {
      ...uh,
      ...dto,
    };
  }

  private convertTimeStringToDate(timeString: string): Date {
    if (!timeString) return null;
    const date = new Date(0);
    const [hours, minutes] = timeString.split(':');
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date;
  }

  // Batch update for daily completed habits
  // @Cron('0 0 * * *') // Run daily at midnight
  // async processDailyHabitCompletion() {
  //   const yesterday = new Date();
  //   yesterday.setDate(yesterday.getDate() - 1);

  //   const completedTracks = await this.dailyTrackRepository.find({
  //     where: {
  //       TRACK_DATE: yesterday,
  //       COMPLETED: true,
  //     },
  //     relations: ['UserHabits', 'UserHabits.habits'],
  //   });

  //   // Group completed tracks by user
  //   const userCompletions = new Map<number, Set<HabitCategories>>();

  //   for (const track of completedTracks) {
  //     const userId = track.UserHabits.UID;
  //     const category = track.UserHabits.habits.CATEGORY;

  //     if (!userCompletions.has(userId)) {
  //       userCompletions.set(userId, new Set());
  //     }
  //     userCompletions.get(userId).add(category);
  //   }

  //   // Update daily completion quests for each user
  //   for (const [userId, categories] of userCompletions) {
  //     for (const category of categories) {
  //       await this.questService.updateQuestProgress(userId, {
  //         category,
  //         trackingType: TrackingType.Count,
  //         value: 1,
  //         date: yesterday,
  //         progressType: 'daily_completion',
  //       });
  //     }
  //   }
  // }

  async getMissionHistory(uid: number, date: Date) {
    /**
     * expected response
     *
     * data : {
     *  daily_habits: {
     *    title: string,
     *    image_url: string,
     *    status: boolean
     * }[]
     *  habits:
     *  quests:
     * }
     *
     */
    const startOfDay = this.dateService.getStartOfDay(date);
    const endOfDay = this.dateService.getEndOfDay(date);

    const [userHabits, userQuests] = await Promise.all([
      this.userHabitsRepository.find({
        where: {
          UID: uid,
          START_DATE: LessThanOrEqual(startOfDay),
          END_DATE: MoreThanOrEqual(endOfDay),
        },
        relations: ['habits', 'dailyTracks'],
        select: {
          habits: {
            TITLE: true,
            THUMBNAIL_URL: true,
            IS_DAILY: true,
          },
          dailyTracks: {
            TRACK_DATE: true,
            COMPLETED: true,
          },
          STATUS: true,
        },
      }),
      this.userQuestRepository.find({
        where: {
          UID: uid,
          START_DATE: LessThanOrEqual(startOfDay),
          END_DATE: MoreThanOrEqual(endOfDay),
        },
        relations: ['quest'],
        select: {
          quest: {
            TITLE: true,
            IMG_URL: true,
          },
          STATUS: true,
        },
      }),
    ]);

    const formatHabits = (habits: UserHabits[], isDaily: boolean) => {
      return habits
        .filter((uh) => uh.habits.IS_DAILY === isDaily)
        .map((uh) => {
          const tracks = uh.dailyTracks.filter((track) =>
            this.dateService.isSameDay(track.TRACK_DATE, date),
          );

          return {
            TITLE: uh.habits.TITLE,
            THUMBNAIL_URL: uh.habits.THUMBNAIL_URL,
            STATUS: {
              HABIT_STATUS: uh.STATUS,
              DAILY_TRACK: tracks[0]?.COMPLETED || false,
            },
          };
        });
    };

    const dailyFormatted = formatHabits(userHabits, true);
    const habitsFormatted = formatHabits(userHabits, false);
    const questsFormatted = userQuests.map((uq) => ({
      TITLE: uq.quest.TITLE,
      THUMBNAIL_URL: uq.quest.IMG_URL,
      STATUS: uq.STATUS,
    }));

    return {
      data: {
        daily_habits: dailyFormatted,
        habits: habitsFormatted,
        quests: questsFormatted,
      },
      meta: {
        date: startOfDay.toISOString() || null,
        total:
          dailyFormatted.length +
            habitsFormatted.length +
            questsFormatted.length || 0,
      },
    };
  }

  async remove(hid: number) {
    const habit = await this.habitsRepository.findOneBy({
      HID: hid,
    });

    if (!habit) {
      throw new NotFoundException(`Habit with ID ${hid} not found`);
    }

    const iconUrls = habit.THUMBNAIL_URL;

    await this.habitsRepository.remove(habit);

    // Clean up associated images
    await this.imageService.deleteImageByUrl(iconUrls);

    return {
      message: `Habit ${habit.TITLE} has been successfully deleted`,
      hid: hid,
    };
  }

  async updateDailyTrack(updateDto: UpdateDailyTrackDto) {
    try {
      const track = await this.dailyTrackRepository.findOne({
        where: {
          TRACK_ID: updateDto.TRACK_ID,
        },
        relations: ['UserHabits'],
      });

      if (!track) {
        throw new NotFoundException(`track id ${updateDto.TRACK_ID} not found`);
      }

      const updated = Object.assign(track, updateDto);
      await this.dailyTrackRepository.save(updated);
      return updated;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Rethrow specific errors
      }

      throw new InternalServerErrorException(
        `Error updating track: ${error.message}`,
      );
    }
  }

  async getHabitsQuestsStatistics(
    params: StatisticsQueryParams,
  ): Promise<StatisticsResponse> {
    const { page, limit, category, search } = params;
    const skip = (page - 1) * limit;

    // Get habits statistics
    const habitsQuery = this.habitsRepository.createQueryBuilder('habit');

    if (category) {
      habitsQuery.where('habit.CATEGORY = :category', { category });
    }

    if (search) {
      habitsQuery.andWhere('habit.TITLE ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const totalHabits = await habitsQuery.getCount();
    const habits = await habitsQuery.skip(skip).take(limit).getMany();

    // Get quests statistics
    const questsQuery = this.questsRepository.createQueryBuilder('quest');

    if (category) {
      questsQuery.where('quest.RELATED_HABIT_CATEGORY = :category', {
        category,
      });
    }

    if (search) {
      questsQuery.andWhere('quest.TITLE ILIKE :search', {
        search: `%${search}%`,
      });
    }

    const totalQuests = await questsQuery.getCount();
    const quests = await questsQuery.skip(skip).take(limit).getMany();

    // Combine and process data
    const habitsData = await Promise.all(
      habits.map(async (habit) => {
        const userHabits = await this.userHabitsRepository.find({
          where: { HID: habit.HID },
        });

        const completedUserHabits = userHabits.filter(
          (uh) => uh.STATUS === HabitStatus.Completed,
        );

        const completeRate =
          userHabits.length > 0
            ? (completedUserHabits.length / userHabits.length) * 100
            : 0;

        // Get mood feedback stats
        const moodStats = await this.getMoodFeedbackStats(habit.HID);

        return {
          title: habit.TITLE,
          image_url: habit.THUMBNAIL_URL,
          habitCategory: this.translateCategory(habit.CATEGORY),
          reward: {
            exp: habit.EXP_REWARD,
            gem: habit.GEM_REWARD || 0,
          },
          completeRate: Math.round(completeRate * 100) / 100, // Round to 2 decimal places
          userCompletionCount: {
            completed: completedUserHabits.length,
            total: userHabits.length,
          },
          moodFeedback: moodStats,
          type: habit.IS_DAILY ? ItemType.DAILY_HABIT : ItemType.HABIT,
        };
      }),
    );

    const questsData = await Promise.all(
      quests.map(async (quest) => {
        const userQuests = await this.userQuestRepository.find({
          where: { QID: quest.QID },
        });

        const completedUserQuests = userQuests.filter(
          (uq) => uq.STATUS === QuestStatus.Completed,
        );

        const completeRate =
          userQuests.length > 0
            ? (completedUserQuests.length / userQuests.length) * 100
            : 0;

        return {
          title: quest.TITLE,
          image_url: quest.IMG_URL,
          habitCategory: this.translateCategory(quest.RELATED_HABIT_CATEGORY),
          reward: {
            exp: quest.EXP_REWARDS,
            gem: quest.GEM_REWARDS || 0,
          },
          completeRate: Math.round(completeRate * 100) / 100, // Round to 2 decimal places
          userCompletionCount: {
            completed: completedUserQuests.length,
            total: userQuests.length,
          },
          moodFeedback: '-',
          type: ItemType.QUEST,
        };
      }),
    );

    // Combine data based on pagination
    let combinedData = [...habitsData, ...questsData];

    // Sort by name (can be modified to sort by other attributes)
    combinedData.sort((a, b) => a.title.localeCompare(b.title));

    // Apply pagination to combined data
    const total = totalHabits + totalQuests;
    const totalPages = Math.ceil(total / limit);

    // If we fetched both habits and quests separately with pagination,
    // we need to adjust for the combined result set
    combinedData = combinedData.slice(0, limit);

    return {
      data: combinedData,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  private async getMoodFeedbackStats(habitId: number): Promise<string> {
    const userHabits = await this.userHabitsRepository.find({
      where: { HID: habitId },
    });

    const challengeIds = userHabits.map((uh) => uh.CHALLENGE_ID);

    if (challengeIds.length === 0) {
      return '-';
    }

    const dailyTracks = await this.dailyTrackRepository
      .createQueryBuilder('track')
      .where('track.CHALLENGE_ID IN (:...challengeIds)', { challengeIds })
      .andWhere('track.MOOD_FEEDBACK IS NOT NULL')
      .getMany();

    if (dailyTracks.length === 0) {
      return '-';
    }

    // Count occurrences of each mood
    const moodCounts = {
      [Moods.HOPELESS]: 0,
      [Moods.STRESSED]: 0,
      [Moods.NEUTRAL]: 0,
      [Moods.SATISFIED]: 0,
      [Moods.CHEERFUL]: 0,
    };

    dailyTracks.forEach((track) => {
      if (track.MOOD_FEEDBACK) {
        moodCounts[track.MOOD_FEEDBACK]++;
      }
    });

    // Find the most common mood
    let mostCommonMood = Moods.NEUTRAL;
    let highestCount = 0;

    for (const [mood, count] of Object.entries(moodCounts)) {
      if (count > highestCount) {
        highestCount = count;
        mostCommonMood = mood as Moods;
      }
    }

    // If no moods found, return dash
    return highestCount > 0 ? mostCommonMood : '-';
  }

  private translateCategory(category: HabitCategories): string {
    const translations = {
      [HabitCategories.Exercise]: 'ออกกำลังกาย',
      [HabitCategories.Sleep]: 'พักผ่อน',
      [HabitCategories.Diet]: 'รับประทานอาหาร',
    };

    return translations[category] || category;
  }
}
