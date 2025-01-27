import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  HabitFilterStatus,
  QueryHabitsDto,
} from '../interfaces/habits.interfaces';
// import { HabitRepository } from '../repositories/habit.repository';
import { CreateHabitDto } from '../dto/create-habit.dto';
import { ImageService } from '../../../image/image.service';
import {
  HabitCategories,
  Habits,
  TrackingType,
} from '@/.typeorm/entities/habit.entity';
import { PaginatedResponse } from '@/response/response.interface';
// import { UserHabitRepository } from '../repositories/user-habit.repository';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { StartHabitChallengeDto } from '../dto/user-habit.dto';
import { UpdateHabitDto } from '../dto/update-habit.dto';
// import { DailyHabitTrackRepository } from '../repositories/track.repository';
import { TrackHabitDto } from '../dto/track-habit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { HabitListFilter } from '../interfaces/habits.interfaces';
import { QuestService } from '../../quest/services/quest.service';

@Injectable()
export class HabitService {
  constructor(
    @InjectRepository(Habits)
    private habitsRepository: Repository<Habits>,
    @InjectRepository(UserHabits)
    private userHabitsRepository: Repository<UserHabits>,
    @InjectRepository(DailyHabitTrack)
    private dailyTrackRepository: Repository<DailyHabitTrack>,
    private readonly imageService: ImageService,
    private readonly questService: QuestService,
  ) {}

  async createHabit(
    createHabitDto: CreateHabitDto,
    file?: Express.Multer.File,
  ): Promise<Habits> {
    const habit = this.habitsRepository.create(createHabitDto);
    if (file) {
      createHabitDto.THUMBNAIL_URL = this.imageService.getImageUrl(
        file.filename,
      );
    }

    return await this.habitsRepository.save(habit);
  }

  async getHabits(
    userId: number,
    filter: HabitListFilter = HabitListFilter.ALL,
    category?: HabitCategories,
    page?: number,
    limit?: number,
    pagination: boolean = false,
  ): Promise<any[]> {
    // Start with habits query
    const habitsQuery = this.habitsRepository.createQueryBuilder('habit');

    if (category) {
      habitsQuery.andWhere('habit.CATEGORY = :category', { category });
    }

    // Get all habits first
    const allHabits = await habitsQuery.getMany();

    // Get user's active habits
    const activeHabits = await this.userHabitsRepository
      .createQueryBuilder('userHabit')
      .where('userHabit.UID = :userId', { userId })
      .andWhere('userHabit.STATUS = :status', { status: HabitStatus.Active })
      .getMany();

    // Create a set of active habit IDs for quick lookup
    const activeHabitIds = new Set(activeHabits.map((h) => h.HID));

    // Process habits based on filter
    let filteredHabits = allHabits;

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
      // For ALL, we keep all habits but will add the status
    }

    // Map habits to include active status and challenge info if exists
    return await Promise.all(
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

          const daysCompleted = activeChallenge.dailyTracks.filter(
            (track) => track.COMPLETED,
          ).length;

          if (activeChallenge) {
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

        return {
          ...habit,
          isActive,
          challengeInfo,
        };
      }),
    );
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

    if (activeChallenge) {
      throw new ConflictException(
        'Active challenge already exists for this habit',
      );
    }

    const userHabit = this.userHabitsRepository.create({
      UID: userId,
      HID: startDto.HID,
      START_DATE: new Date(),
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
    });

    // Calculate end date
    const endDate = new Date();
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
    const trackDate = new Date();

    if (!userHabit) {
      throw new NotFoundException('Challenge not found');
    }

    if (userHabit.STATUS !== HabitStatus.Active) {
      throw new BadRequestException('Challenge is not active');
    }

    if (trackDate > userHabit.END_DATE) {
      throw new BadRequestException('Cannot track after challenge end date');
    }

    // Find or create daily track
    let dailyTrack = await this.dailyTrackRepository.findOne({
      where: {
        CHALLENGE_ID: trackDto.CHALLENGE_ID,
        TRACK_DATE: trackDate,
      },
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

    // dailyTrack.NOTES = trackDto.notes;
    await this.dailyTrackRepository.save(dailyTrack);
    await this.questService.updateQuestProgress(userId, {
      category: userHabit.habits.CATEGORY,
      exerciseType: userHabit.habits.EXERCISE_TYPE,
      trackingType: userHabit.habits.TRACKING_TYPE,
      value: trackingValue,
      date: new Date(trackDto.TRACK_DATE),
    });
    // Update streak and check completion
    await this.updateStreakCount(userHabit.CHALLENGE_ID);
    await this.checkChallengeCompletion(userHabit.CHALLENGE_ID);

    return dailyTrack;
  }

  private async updateStreakCount(challengeId: number): Promise<void> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: { CHALLENGE_ID: challengeId },
      relations: ['dailyTracks', 'habits'],
    });

    const sortedTracks = userHabit.dailyTracks.sort(
      (a, b) => b.TRACK_DATE.getTime() - a.TRACK_DATE.getTime(),
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
        date: new Date(),
        progressType: 'streak', // Add this to differentiate streak updates
      });
    }
  }

  private async checkChallengeCompletion(challengeId: number): Promise<void> {
    const userHabit = await this.userHabitsRepository.findOne({
      where: { CHALLENGE_ID: challengeId },
      relations: ['dailyTracks', 'habits'],
    });

    const today = new Date();
    if (today > userHabit.END_DATE) {
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
          date: new Date(),
          progressType: 'completion'
        });
        // TODO: Implement reward system
        // await this.rewardService.awardHabitCompletion(userHabit);
      } else {
        userHabit.STATUS = HabitStatus.Failed;
      }

      await this.userHabitsRepository.save(userHabit);
    }
  }

  async getUserHabits(
    userId: number,
    status?: HabitStatus,
  ): Promise<UserHabits[]> {
    const queryBuilder = this.userHabitsRepository
      .createQueryBuilder('userHabit')
      .leftJoinAndSelect('userHabit.habits', 'habit')
      .leftJoinAndSelect('userHabit.dailyTracks', 'tracks')
      .where('userHabit.UID = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('userHabit.STATUS = :status', { status });
    }

    return await queryBuilder.getMany();
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
    }

    return {
      totalDays,
      completedDays,
      currentStreak,
      totalValue,
      progressPercentage: (completedDays / totalDays) * 100,
      status: userHabit.STATUS,
    };
  }
}

// @Injectable()
// export class HabitService {
//   constructor(
//     private readonly habitRepository: HabitRepository,
//     private readonly userHabitRepository: UserHabitRepository,
//     private readonly imageService: ImageService,
//     private readonly dailyTrack: DailyHabitTrackRepository,
//   ) {}

//   getRec() {
//     return;
//   }

//   async searchHabits(params: {
//     uid?: number;
//     page?: number;
//     limit?: number;
//     pagination?: boolean;
//     filterCategory?: HabitCategories;
//     filterStatus?: HabitFilterStatus;
//     query?: string;
//   }): Promise<{
//     data?: { habits: Habits; habitProgress: UserHabits }[];
//     meta: {
//       total: number;
//       page: number;
//       limit: number | null;
//       totalPages: number;
//     };
//   }> {
//     const { uid, filterCategory, ...habitParams } = params;
//     const { query, ...userHabitParams } = params;

//     const { data: habits, total: habitsTotal } =
//       await this.habitRepository.findAll(habitParams);
//     const { data: userHabit, total: userHabitsTotal } =
//       await this.userHabitRepository.getUserHabits(userHabitParams);

//     let filteredHabits = [...habits];
//     let total = habitsTotal;

//     if (params.filterStatus) {
//       switch (params.filterStatus) {
//         case HabitFilterStatus.Doing:
//           // Filter habits that exist in userHabit
//           filteredHabits = habits.filter((habit) =>
//             userHabit.some((uh) => uh.HID === habit.HID),
//           );
//           total = filteredHabits.length;
//           break;
//         case HabitFilterStatus.NotDoing:
//           // Filter habits that don't exist in userHabit
//           filteredHabits = habits.filter(
//             (habit) => !userHabit.some((uh) => uh.HID === habit.HID),
//           );
//           total = filteredHabits.length;
//           break;
//         default:
//           break;
//       }
//     }

//     const data = filteredHabits.map((habit) => ({
//       habits: habit,
//       habitProgress: userHabit.find((uh) => uh.HID === habit.HID) || null,
//     }));

//     return {
//       data,
//       meta: {
//         total,
//         page: params.page || 1,
//         limit: params.limit || null,
//         totalPages: Math.ceil(total / (params.limit || total)) || 1,
//       },
//     };
//   }

//   async getHabitById(hid: number) {
//     return await this.habitRepository.findById(hid);
//   }

//   async createNewHabit(
//     dto: CreateHabitDto,
//     file?: Express.Multer.File,
//   ): Promise<Habits> {
//     if (file) {
//       dto.THUMBNAIL_URL = this.imageService.getImageUrl(file.filename);
//     }

//     return await this.habitRepository.create(dto);
//   }

//   async updateHabit(dto: UpdateHabitDto, file?: Express.Multer.File) {
//     if (file) {
//       dto.THUMBNAIL_URL = this.imageService.getImageUrl(file.filename);
//     }

//     return await this.habitRepository.update(dto.HID, dto);
//   }

//   async assignHabitToUser(dto: StartHabitChallengeDto) {
//     return await this.userHabitRepository.create(dto);
//   }

//   async completeDailyHabit(dto: CreateDailyTrackDto) {
//     const track = await this.dailyTrack.create(dto);

//     const userHabit = await this.userHabitRepository.getUserHabitById(
//       dto.CHALLENGE_ID,
//     );

//     if (track.MINUTES_SPENT) {
//       // const
//     }

//     /*
//     task after finish daily track
//      1. update user log
//      2. if last day of track update rewards, have popup ui
//      3. if any relate quest complete, have popup ui
//      4. streak count update
//      */

//     /*
//      expexted response
//      habit_detail: hid, title,
//      challenge_detail(user_habit): day_goals, daily_minute_goal, streak_count, noti {isEnable, Weekdays}
//      track_detail:
//      related_quests: for popup complete quest
//       */
//   }
// }
