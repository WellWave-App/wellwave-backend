import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, MoreThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../.typeorm/entities/users.entity';
import { LoginStreakService } from '@/login-streak/services/login-streak.service';
// import { LogsService } from '@/user-logs/services/logs.service';
import { ImageService } from '@/image/image.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { RiskCalculator } from '../../recommendation/utils/risk-calculator.util';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { order, userSortList } from '../interfaces/user-list.interface';
import { PaginatedResponse } from '@/response/response.interface';
import {
  QuestStatus,
  UserQuests,
} from '@/.typeorm/entities/user-quests.entity';
import { HabitCategories } from '@/.typeorm/entities/habit.entity';
import { LogsService } from '@/user-logs/services/logs.service';
import { THAI_MONTHS } from '../interfaces/date.formatter';
import { CheckinChallengeService } from '@/checkin-challenge/services/checkin-challenge.service';
import { LOG_NAME } from '@/.typeorm/entities/logs.entity';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { Role } from '@/auth/roles/roles.enum';
import { DateService } from '@/helpers/date/date.services';
import { AchievementService } from '@/achievement/services/achievement.service';
import { LeaderboardService } from '@/leagues/services/leagues.service';
import { LeagueType } from '@/leagues/enum/lagues.enum';
import { ShopItemType } from '@/shop/enum/item-type.enum';
import { UserItems } from '@/.typeorm/entities/user-items.entity';
import { ShopItem } from '@/.typeorm/entities/shop-items.entity';

interface MissionHistoryRecord {
  date: string;
  missionType: string;
  activityType: string;
  detail: string;
  status: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly loginStreakService: LoginStreakService,
    private readonly imageService: ImageService,
    private readonly checkinService: CheckinChallengeService,
    // @InjectRepository(UserReadHistory)
    // private userReadHistoryRepository: Repository<UserReadHistory>,
    @InjectRepository(UserHabits)
    private userHabit: Repository<UserHabits>,
    @InjectRepository(UserQuests)
    private userQuest: Repository<UserQuests>,
    private logsService: LogsService,
    @InjectRepository(DailyHabitTrack)
    private dailyHabitTrackRepository: Repository<DailyHabitTrack>,
    private dateService: DateService,
    private achievementService: AchievementService,
    private leaderboardService: LeaderboardService,
    @InjectRepository(UserItems)
    private userItemsRepository: Repository<UserItems>,
    @InjectRepository(ShopItem)
    private shopItemRepository: Repository<ShopItem>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exist = await this.usersRepository.findOne({
      where: { EMAIL: createUserDto.EMAIL },
    });

    if (exist) {
      throw new ConflictException('This Email has been used');
    }

    const user = this.usersRepository.create();

    if (createUserDto.PASSWORD) {
      user.setPassword(createUserDto.PASSWORD);
      const { PASSWORD, ...otherField } = createUserDto;
      Object.assign(user, otherField);
    } else {
      Object.assign(user, createUserDto);
    }

    const data = await this.usersRepository.save(user);

    if (createUserDto.ROLE === Role.USER) {
      await this.leaderboardService.create(data, {
        UID: data.UID,
        CURRENT_LEAGUE: LeagueType.NONE,
      });
    }

    return data;
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { EMAIL: email },
    });
    return user || null;
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ USERS: User[]; total: number }> {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validate that pageNum and limitNum are numbers and not less than 1
    const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validatedLimit = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;

    const [users, total] = await this.usersRepository.findAndCount({
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      // relations: ['logs']
      order: { createAt: 'ASC' },
    });

    return { USERS: users, total };
  }

  async getById(uid: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }
    return user;
  }

  async updatePassword(uid: number, newPassword: string) {
    try {
      const user = await this.getById(uid);
      user.setPassword(newPassword);
      Object.assign(user, { PASSWORD: newPassword });
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(
    uid: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    if (updateUserDto.EMAIL) {
      const exist = await this.usersRepository.findOne({
        where: {
          EMAIL: updateUserDto.EMAIL,
          UID: Not(uid),
        },
      });

      if (exist) {
        throw new ConflictException('This Email has been used');
      }
    }

    if (updateUserDto.USERNAME) {
      const exist = await this.usersRepository.findOne({
        where: {
          USERNAME: updateUserDto.USERNAME,
          UID: Not(uid),
        },
      });

      if (exist) {
        throw new ConflictException('This Username has been used');
      }
    }

    if (updateUserDto.USERNAME) {
      const exist = await this.usersRepository.findOne({
        where: { USERNAME: updateUserDto.USERNAME },
      });

      if (exist) {
        throw new ConflictException('This Username has been used');
      }
    }

    const user = await this.getById(uid);

    if (file) {
      const filename = file.filename;
      updateUserDto.IMAGE_URL = this.imageService.getImageUrl(filename);
    }

    // Clean up the DTO by removing any undefined values
    const cleanedDto: UpdateUserDto = Object.entries(updateUserDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    // Handle password separately
    if ('PASSWORD' in cleanedDto) {
      user.setPassword(cleanedDto.PASSWORD);
    }

    // Update other fields
    Object.assign(user, cleanedDto);

    return await this.usersRepository.save(user);
  }

  async remove(uid: number): Promise<{ message: string; success: boolean }> {
    const result = await this.usersRepository.delete(uid);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    return {
      message: `User with UID ${uid} successfully deleted`,
      success: true,
    };
  }

  async getProfile(uid: number) {
    //userInfo
    const user = await this.usersRepository.findOne({
      where: { UID: uid },
      relations: ['league'],
    });

    if (!user) {
      throw new NotFoundException('user not found, please re-login');
    }

    // loginStats
    // get week start date end date
    const today = new Date(this.dateService.getCurrentDate().timestamp);
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const daysToMonday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    start.setDate(today.getDate() - daysToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday

    const loginStats = await this.checkinService.getStats(uid);

    // achievements
    const userAchieved = await this.achievementService.getUserAchieved({
      userId: uid,
      page: 1,
      limit: 4,
    });

    const formatUA =
      userAchieved?.data.map((ua) => ({
        imgPath: ua.achievement.levels[ua.LEVEL - 1].ICON_URL,
        achTitle: `${ua.achievement.TITLE} ระดับ${ua.LEVEL}`,
        dateAcheived: ua.ACHIEVED_DATE,
      })) || [];
    // log
    const weeklyGoal = await this.getWeeklyMissionProgress(uid);
    const { league, ...userData } = user;
    return {
      userInfo: userData,
      userLeague: user.league,
      weeklyGoal,
      loginStats,
      usersAchievement: formatUA,
    };
  }

  async getUserLists(
    page: number = 1,
    limit: number = 10,
    searchUID?: string,
    sortBy: userSortList = 'uid',
    order: order = 'ASC',
  ): Promise<PaginatedResponse<any>> {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .where('user.ROLE = :role', { role: Role.USER })
      .leftJoinAndSelect('user.RiskAssessment', 'risks')
      .leftJoinAndSelect('user.loginStreak', 'login')
      .leftJoinAndSelect('user.habits', 'habit')
      .leftJoinAndSelect('user.quests', 'quest')
      .leftJoinAndSelect('habit.dailyTracks', 'dailyTracks')
      .leftJoinAndSelect('habit.habits', 'habitDetail')
      .leftJoinAndSelect('quest.quest', 'questDetail')
      .skip((page - 1) * limit)
      .take(limit);
    // .orderBy(`user.${sortBy}`, order);

    if (searchUID) {
      queryBuilder.andWhere('CAST(user.UID AS TEXT) ILIKE :search', {
        search: `%${searchUID}%`,
      });
    }

    const sortConfig = {
      uid: 'user.UID',
      hypertension: 'risks.HYPERTENSION',
      diabetes: 'risks.DIABETES',
      obesity: 'risks.OBESITY',
      dyslipidemia: 'risks.DYSLIPIDEMIA',
      last_login: 'login.LAST_LOGIN_DATE',
    };
    if (sortBy in sortConfig) {
      queryBuilder.orderBy(sortConfig[sortBy], order);
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    const processedData = data.map((user) => {
      const riskAssessment = this.calculateRiskWeights(user.RiskAssessment);
      const loginStats = this.calculateLoginStats(user.loginStreak);
      const { OVERALL_PERCENTAGE: completeRate } = this.getOverallCompleteRate(
        user.habits,
        user.quests,
      );

      return {
        UID: user.UID,
        USERNAME: user.USERNAME,
        EMAIL: user.EMAIL,
        RISK_ASSESSMENT: riskAssessment,
        COMPLETE_RATE: completeRate || 0,
        LOGIN_STATS: loginStats,
      };
    });

    if (sortBy === 'complete_rate') {
      processedData.sort((a, b) => {
        return order === 'ASC'
          ? a.COMPLETE_RATE - b.COMPLETE_RATE
          : b.COMPLETE_RATE - a.COMPLETE_RATE;
      });
    } else if (sortBy === 'streak') {
      processedData.sort((a, b) => {
        return order === 'ASC'
          ? a.LOGIN_STATS.LOGIN_STREAK - b.LOGIN_STATS.LOGIN_STREAK
          : b.LOGIN_STATS.LOGIN_STREAK - a.LOGIN_STATS.LOGIN_STREAK;
      });
    }

    return {
      data: processedData,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getHealthHistory(
    uid: number,
    page: number = 1,
    limit: number = 5,
    type: 'graph_log' | 'mission' | 'health_log',
    fromDate: Date,
    toDate: Date,
    sortLogBy: 'date' | 'log_name' | 'log_status' = 'date',
    sortMissionBy: 'date' | 'mission_type' | 'activity_type' = 'date',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const processedData = {
      data: { graph_log: null, mission: null, health_log: null },
      meta: null,
    };

    if (type === 'graph_log') {
      const data = await this.logsService.getAllLogs(fromDate, toDate, uid);
      processedData.data.graph_log = data || null;
    } else if (type === 'health_log') {
      const { data: logData, meta } = await this.logsService.getLogsWithStatus(
        fromDate,
        toDate,
        page || 1,
        limit || 10,
        uid,
        sortLogBy,
        order,
      );
      processedData.data.health_log = logData || null;
      processedData.meta = meta || null;
    } else {
      const { data: missionData, meta } = await this.getMissionHistory(
        uid,
        fromDate,
        toDate,
        page || 1,
        limit || 5,
        sortMissionBy,
        order,
      );
      processedData.data.mission = missionData || null;
      processedData.meta = meta || null;
    }

    return processedData;
  }

  async getDeepProfile(uid: number, page: number = 1, limit: number = 10) {
    const data = await this.usersRepository.findOne({
      where: { UID: uid },
      relations: [
        'LOGS',
        'RiskAssessment',
        'loginStreak',
        'quests',
        'habits',
        'articleReadHistory',
      ],
    });

    if (!data) {
      throw new NotFoundException('User not found');
    }
    const {
      PASSWORD,
      LOGS,
      RiskAssessment,
      loginStreak,
      quests,
      habits,
      articleReadHistory,
      ...userInfo
    } = data;
    const risk = this.calculateRiskWeights(RiskAssessment);
    const streakLogin = this.calculateLoginStats(loginStreak);
    const completeRate = this.getOverallCompleteRate(habits, quests);
    // *formatting risk

    const RISK_ASSESSMENT = RiskAssessment
      ? {
          ...RiskAssessment,
          ...risk,
          UID: undefined,
          createAt: undefined,
        }
      : null;

    const profile = {
      ...userInfo,
      AGE:
        new Date(this.dateService.getCurrentDate().timestamp).getFullYear() -
        new Date(data.YEAR_OF_BIRTH).getFullYear(),
      RISK_ASSESSMENT,
      LOGIN_STATS: streakLogin,
      COMPLETE_RATE: completeRate,
      CURRENT_LEAGUE: {
        LB_ID: 2,
        LEAGUE_NAME: 'Silver',
        ICON_URL: null,
        RANKING: 1,
      },
    };
    return { data: profile };
  }

  async getMissionHistory(
    uid: number,
    fromDate: Date,
    toDate: Date,
    page: number = 1,
    limit: number = 5,
    sortMissionBy: 'date' | 'mission_type' | 'activity_type' = 'date',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const user = await this.usersRepository.findOne({
      where: { UID: uid },
      relations: ['habits', 'quests'],
    });

    if (!user) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    // Collect habit tracking records
    const habitRecords: MissionHistoryRecord[] = user.habits.flatMap((uh) =>
      uh.dailyTracks
        .filter((track) => {
          const trackDate = new Date(track.TRACK_DATE);
          return trackDate >= fromDate && trackDate <= toDate;
        })
        .map((track) => ({
          date: this.toThaiDate(new Date(track.TRACK_DATE)),
          missionType: 'ภารกิจปรับนิสัย',
          activityType: uh.habits.CATEGORY,
          detail: uh.habits.TITLE,
          status: track.COMPLETED ? 'สำเร็จ' : 'ไม่สำเร็จ',
        })),
    );

    // Collect quest records
    const questRecords: MissionHistoryRecord[] = user.quests
      .filter((uq) => {
        const questDate = new Date(uq.START_DATE);
        return questDate >= fromDate && questDate <= toDate;
      })
      .map((uq) => ({
        date: this.toThaiDate(new Date(uq.START_DATE)),
        missionType: 'เควส',
        activityType: uq.quest.RELATED_HABIT_CATEGORY,
        detail: uq.quest.TITLE,
        status: this.getQuestStatus(uq.STATUS),
      }));

    // Combine and sort all records
    const allRecords = [...habitRecords, ...questRecords];
    const sortedRecords = this.sortMissionRecords(
      allRecords,
      sortMissionBy,
      order,
    );

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedRecords = sortedRecords.slice(
      startIndex,
      startIndex + limit,
    );

    return {
      data: paginatedRecords,
      meta: {
        total: allRecords.length,
        page,
        limit,
        totalPages: Math.ceil(allRecords.length / limit),
      },
    };
  }

  private sortMissionRecords(
    records: MissionHistoryRecord[],
    sortBy: 'date' | 'mission_type' | 'activity_type',
    order: 'ASC' | 'DESC',
  ): MissionHistoryRecord[] {
    return records.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case 'mission_type':
          comparison = a.missionType.localeCompare(b.missionType);
          break;
        case 'activity_type':
          comparison = a.activityType.localeCompare(b.activityType);
          break;
      }
      return order === 'ASC' ? comparison : -comparison;
    });
  }

  private getQuestStatus(status: QuestStatus): string {
    switch (status) {
      case QuestStatus.Completed:
        return 'สำเร็จ';
      case QuestStatus.Active:
        return 'กำลังทำ';
      default:
        return 'ไม่สำเร็จ';
    }
  }

  private calculateRiskWeights(riskAssessment: any) {
    if (!riskAssessment) return null;

    return {
      DIABETES: RiskCalculator.calculateDiabetesWeight(riskAssessment.DIABETES),
      HYPERTENSION: RiskCalculator.calculateHypertensionWeight(
        riskAssessment.HYPERTENSION,
      ),
      DYSLIPIDEMIA: RiskCalculator.calculateDyslipidemiaWeight(
        riskAssessment.DYSLIPIDEMIA,
      ),
      OBESITY: RiskCalculator.calculateObesityWeight(riskAssessment.OBESITY),
    };
  }

  private getOverallCompleteRate(habits: UserHabits[], quests: UserQuests[]) {
    if ((!habits || habits.length === 0) && (!quests || quests.length === 0)) {
      return {
        OVERALL_PERCENTAGE: 0,
        MISSTION_TYPES: { DAILY_HABIT: 0, HABIT: 0, QUEST: 0 },
        ACTIVITY_TYPES: { EXERCISE: 0, SLEEP: 0, DIET: 0 },
      };
    }

    // Calculate habits completion
    const habitsByType = habits?.reduce(
      (acc, habit) => {
        if (habit.STATUS !== HabitStatus.Cancled) {
          const completedTracks =
            habit.dailyTracks?.filter((track) => track.COMPLETED).length || 0;
          const totalTracks = habit.DAYS_GOAL;

          // Update mission types
          acc.dailyHabitTotal += totalTracks;
          acc.dailyHabitCompleted += completedTracks;

          // Update activity types
          if (habit.habits.CATEGORY === HabitCategories.Exercise) {
            acc.exerciseTotal += totalTracks;
            acc.exerciseCompleted += completedTracks;
          } else if (habit.habits.CATEGORY === HabitCategories.Sleep) {
            acc.sleepTotal += totalTracks;
            acc.sleepCompleted += completedTracks;
          } else if (habit.habits.CATEGORY === HabitCategories.Diet) {
            acc.dietTotal += totalTracks;
            acc.dietCompleted += completedTracks;
          }
        }
        return acc;
      },
      {
        dailyHabitTotal: 0,
        dailyHabitCompleted: 0,
        exerciseTotal: 0,
        exerciseCompleted: 0,
        sleepTotal: 0,
        sleepCompleted: 0,
        dietTotal: 0,
        dietCompleted: 0,
      },
    ) || {
      dailyHabitTotal: 0,
      dailyHabitCompleted: 0,
      exerciseTotal: 0,
      exerciseCompleted: 0,
      sleepTotal: 0,
      sleepCompleted: 0,
      dietTotal: 0,
      dietCompleted: 0,
    };

    // Calculate quests completion
    const questsByType = quests?.reduce(
      (acc, quest) => {
        if (quest.STATUS === QuestStatus.Completed) {
          acc.questCompleted++;
          if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Exercise)
            acc.exerciseCompleted++;
          else if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Sleep)
            acc.sleepCompleted++;
          else if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Diet)
            acc.dietCompleted++;
        }
        acc.questTotal++;
        if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Exercise)
          acc.exerciseTotal++;
        else if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Sleep)
          acc.sleepTotal++;
        else if (quest.quest.RELATED_HABIT_CATEGORY === HabitCategories.Diet)
          acc.dietTotal++;
        return acc;
      },
      {
        questTotal: 0,
        questCompleted: 0,
        exerciseTotal: 0,
        exerciseCompleted: 0,
        sleepTotal: 0,
        sleepCompleted: 0,
        dietTotal: 0,
        dietCompleted: 0,
      },
    ) || {
      questTotal: 0,
      questCompleted: 0,
      exerciseTotal: 0,
      exerciseCompleted: 0,
      sleepTotal: 0,
      sleepCompleted: 0,
      dietTotal: 0,
      dietCompleted: 0,
    };

    const calculatePercentage = (completed: number, total: number): number =>
      total > 0 ? Number(((completed / total) * 100).toFixed(2)) : 0;

    return {
      OVERALL_PERCENTAGE: calculatePercentage(
        habitsByType.dailyHabitCompleted + questsByType.questCompleted,
        habitsByType.dailyHabitTotal + questsByType.questTotal,
      ),
      MISSTION_TYPES: {
        DAILY_HABIT: calculatePercentage(
          habitsByType.dailyHabitCompleted,
          habitsByType.dailyHabitTotal,
        ),
        HABIT: calculatePercentage(
          habitsByType.dailyHabitCompleted,
          habitsByType.dailyHabitTotal,
        ),
        QUEST: calculatePercentage(
          questsByType.questCompleted,
          questsByType.questTotal,
        ),
      },
      ACTIVITY_TYPES: {
        EXERCISE: calculatePercentage(
          habitsByType.exerciseCompleted + questsByType.exerciseCompleted,
          habitsByType.exerciseTotal + questsByType.exerciseTotal,
        ),
        SLEEP: calculatePercentage(
          habitsByType.sleepCompleted + questsByType.sleepCompleted,
          habitsByType.sleepTotal + questsByType.sleepTotal,
        ),
        DIET: calculatePercentage(
          habitsByType.dietCompleted + questsByType.dietCompleted,
          habitsByType.dietTotal + questsByType.dietTotal,
        ),
      },
    };
  }

  private calculateLoginStats(loginStreak: any): {
    LOGIN_STREAK: number;
    LASTED_LOGIN: Date | null;
    STREAK_START: Date | null;
  } {
    if (!loginStreak) {
      return {
        LOGIN_STREAK: 0,
        LASTED_LOGIN: null,
        STREAK_START: null,
      };
    }

    const now = new Date(this.dateService.getCurrentDate().timestamp);
    const lastLogin = new Date(loginStreak.LAST_LOGIN_DATE);
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      LOGIN_STREAK:
        daysSinceLastLogin <= 1
          ? loginStreak.CURRENT_STREAK
          : -daysSinceLastLogin,
      LASTED_LOGIN: loginStreak.LAST_LOGIN_DATE,
      STREAK_START: loginStreak.STREAK_START_DATE,
    };
  }

  toThaiDate(
    date: Date,
    options: {
      monthLength?: 'short' | 'full';
      buddhistYear?: boolean;
      delimiter?: string;
    } = {},
  ): string {
    const {
      monthLength = 'full',
      buddhistYear = true,
      delimiter = ' ',
    } = options;

    // Get date components
    const day = date.getDate().toString().padStart(2, '0');
    const month = THAI_MONTHS[monthLength][date.getMonth()];
    const year = date.getFullYear() + (buddhistYear ? 543 : 0);

    return `${day}${delimiter}${month}${delimiter}${year}`;
  }

  async getWeeklyMissionProgress(uid: number, fromDate?: Date, toDate?: Date) {
    // Get date range, default to current week if not provided
    const dateRange =
      fromDate && toDate
        ? { startOfWeek: fromDate, endOfWeek: toDate }
        : this.dateService.getCurrentWeekRange();

    const { startOfWeek, endOfWeek } = dateRange;

    // Get user with relations
    const user = await this.usersRepository.findOne({
      where: {
        UID: uid,
      },
      relations: ['habits', 'quests'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    const { USER_GOAL_EX_TIME_WEEK, USER_GOAL_STEP_WEEK, habits, quests } =
      user;

    // Calculate habit statistics
    const habitStats = habits?.reduce(
      (acc, habit) => {
        acc[habit.STATUS]++;
        return acc;
      },
      { [HabitStatus.Active]: 0, [HabitStatus.Completed]: 0 },
    ) || {
      [HabitStatus.Active]: 0,
      [HabitStatus.Completed]: 0,
    };

    // Calculate quest statistics
    const questStats = quests?.reduce(
      (acc, quest) => {
        acc[quest.STATUS]++;
        return acc;
      },
      { [QuestStatus.Active]: 0, [QuestStatus.Completed]: 0 },
    ) || {
      [QuestStatus.Active]: 0,
      [QuestStatus.Completed]: 0,
    };

    // Get step logs for the date range
    const stepLogs = await this.logsService.getLogsByUserAndType(
      uid,
      LOG_NAME.STEP_LOG,
      startOfWeek,
      endOfWeek,
    );

    // Get daily habit tracks for the date range
    const dailyTracks = await this.dailyHabitTrackRepository.find({
      where: {
        UserHabits: { UID: uid },
        TRACK_DATE: Between(startOfWeek, endOfWeek),
      },
    });

    // Calculate total exercise minutes
    const totalExerciseMinutes = dailyTracks.reduce(
      (acc, track) => acc + (track.DURATION_MINUTES || 0),
      0,
    );

    // Calculate total steps
    const totalSteps =
      stepLogs.LOGS?.reduce((acc, log) => acc + (log.VALUE || 0), 0) || 0;

    // Calculate days left
    const now = new Date(this.dateService.getCurrentDate().timestamp);
    const daysLeft =
      now > endOfWeek
        ? 0
        : Math.ceil(
            (endOfWeek.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

    return {
      dateRange: {
        from: this.dateService.formatDate(startOfWeek),
        to: this.dateService.formatDate(endOfWeek),
      },
      progress: {
        step: {
          current: totalSteps,
          goal: USER_GOAL_STEP_WEEK,
          // percentage: Math.min(100, (totalSteps / USER_GOAL_STEP_WEEK) * 100),
        },
        exercise_time: {
          current: totalExerciseMinutes,
          goal: USER_GOAL_EX_TIME_WEEK,
          // percentage: Math.min(
          //   100,
          //   (totalExerciseMinutes / USER_GOAL_EX_TIME_WEEK) * 100,
          // ),
        },
        mission: {
          current:
            (habitStats[HabitStatus.Completed] || 0) +
            (questStats[QuestStatus.Completed] || 0),
          goal:
            (habitStats[HabitStatus.Active] || 0) +
            (questStats[QuestStatus.Active] || 0),
          // percentage: Math.min(
          //   100,
          //   ((habitStats[HabitStatus.Completed] +
          //     questStats[QuestStatus.Completed]) /
          //     (habitStats[HabitStatus.Active] +
          //       questStats[QuestStatus.Active])) *
          //     100 || 0,
          // ),
        },
      },
      daysLeft,
      // isCurrentWeek: this.dateService.isDateInRange(
      //   now,
      //   startOfWeek,
      //   endOfWeek,
      // ),
    };
  }

  async getMissionLogs(uid: number, fromDate?: Date, toDate?: Date) {
    // Get date range, default to current week if not provided
    const dateRange =
      fromDate && toDate
        ? { startOfWeek: fromDate, endOfWeek: toDate }
        : this.dateService.getCurrentWeekRange();

    const { startOfWeek, endOfWeek } = dateRange;

    // Get step logs for the date range
    const stepLogs = await this.logsService.getLogsByUserAndType(
      uid,
      LOG_NAME.STEP_LOG,
      startOfWeek,
      endOfWeek,
    );

    // Get daily habit tracks for the date range
    const dailyTracks = await this.dailyHabitTrackRepository.find({
      where: {
        UserHabits: { UID: uid },
        TRACK_DATE: Between(startOfWeek, endOfWeek),
      },
      order: {
        TRACK_DATE: 'ASC',
      },
    });

    // Format habit&step tracks
    const habits = dailyTracks.map((track) => ({
      value: track.DURATION_MINUTES || 0,
      date: this.dateService.formatDate(new Date(track.TRACK_DATE)),
    }));

    const step = stepLogs.LOGS.map((log) => ({
      value: log.VALUE || 0,
      date: this.dateService.formatDate(new Date(log.DATE)),
    }));
    return {
      dateRange: {
        from: this.dateService.formatDate(startOfWeek),
        to: this.dateService.formatDate(endOfWeek),
      },
      data: {
        step,
        habits,
      },
    };
  }

  async getUserLeaderboard(uid: number) {
    try {
      const user = await this.usersRepository.findOne({
        where: { UID: uid },
        relations: ['league'],
      });

      return await this.leaderboardService.getUsersLeaderboards(user);
    } catch (error) {
      throw new InternalServerErrorException(
        `${error.message || 'Internal Server Error'}`,
      );
    }
  }

  async getUserItems(
    uid: number,
    filter: {
      type?: ShopItemType;
      isActive?: boolean;
    },
  ): Promise<PaginatedResponse<UserItems>> {
    const { type, isActive } = filter;
    const user = await this.usersRepository.findOne({
      where: { UID: uid },
      relations: ['userItems', 'userItems.item'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    // Apply filters after fetching
    let filteredItems = user.userItems;

    if (isActive !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.IS_ACTIVE === isActive,
      );
    }

    if (type !== undefined) {
      filteredItems = filteredItems.filter(
        (item) => item.item.ITEM_TYPE === type,
      );
    }

    return { data: filteredItems, meta: { total: filteredItems.length } };
  }

  async activeItem(userId: number, userItemId: number) {
    const today = new Date(this.dateService.getCurrentDate().timestamp);
    // Find the specific user item directly
    const userItem = await this.userItemsRepository.findOne({
      where: {
        UID: userId,
        USER_ITEM_ID: userItemId,
      },
      relations: ['item', 'item.expBooster', 'item.gemExchange', 'user'],
    });

    if (!userItem) {
      throw new NotFoundException(
        `Item ${userItemId} not found for user ${userId}`,
      );
    }

    // Check if the item is already expired
    if (userItem.EXPIRE_DATE && today > userItem.EXPIRE_DATE) {
      throw new BadRequestException(`Item has already expired`);
    }

    // Check if the item is already active
    if (userItem.IS_ACTIVE) {
      // Item is already active, nothing to do
      return { message: 'Item is already active', item: userItem };
    }

    // Item type specific logic
    switch (userItem.item.ITEM_TYPE) {
      case ShopItemType.EXP_BOOST:
        if (!userItem.item.expBooster) {
          throw new BadRequestException('EXP booster details not found');
        }

        // Set expiration date based on boost days
        const expiryDate = today;
        expiryDate.setDate(
          expiryDate.getDate() + userItem.item.expBooster.BOOST_DAYS,
        );
        userItem.EXPIRE_DATE = expiryDate;

        // Deactivate other active boosters of the same type
        const otherActiveExpBoosters = await this.userItemsRepository.find({
          where: {
            UID: userId,
            IS_ACTIVE: true,
            item: {
              ITEM_TYPE: ShopItemType.EXP_BOOST,
            },
            USER_ITEM_ID: Not(userItem.USER_ITEM_ID), // Exclude current item
          },
          relations: ['item'],
        });

        for (const booster of otherActiveExpBoosters) {
          booster.IS_ACTIVE = false;
          await this.userItemsRepository.save(booster);
        }
        break;

      case ShopItemType.GEM_EXCHANGE:
        if (!userItem.item.gemExchange) {
          throw new BadRequestException('Gem exchange details not found');
        }

        // Add gems to user account
        userItem.user.GEM =
          (userItem.user.GEM || 0) + userItem.item.gemExchange.GEM_REWARD;
        await this.usersRepository.save(userItem.user);

        // Gem exchanges are consumed immediately after use
        userItem.IS_ACTIVE = false;
        userItem.EXPIRE_DATE = today;
        await this.userItemsRepository.save(userItem);

        return {
          message: `Successfully exchanged for ${userItem.item.gemExchange.GEM_REWARD} gems`,
          gems: userItem.user.GEM,
        };

      default:
        // For other item types, just activate them
        break;
    }

    // Set the item as active
    userItem.IS_ACTIVE = true;
    await this.userItemsRepository.save(userItem);

    return {
      message: 'Item activated successfully',
      item: userItem,
    };
  }
}
