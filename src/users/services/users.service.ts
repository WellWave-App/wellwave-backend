import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Not, Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../.typeorm/entities/users.entity';
import { RegisterUserDto } from '../dto/register.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { LoginStreakService } from '@/login-streak/services/login-streak.service';
// import { LogsService } from '@/user-logs/services/logs.service';
import { ImageService } from '@/image/image.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserReadHistoryService } from '@/article-group/user-read-history/services/user-read-history.service';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { query } from 'express';
import { RiskCalculator } from '../../recommendation/utils/risk-calculator.util';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { RecommendationModule } from '@/recommendation/recommendation.module';
import { order, userSortList } from '../interfaces/user-list.interface';
import { PaginatedResponse } from '@/response/response.interface';
import {
  QuestStatus,
  UserQuests,
} from '@/.typeorm/entities/user-quests.entity';
import { HabitCategories } from '@/.typeorm/entities/habit.entity';
import { LogsService } from '@/user-logs/services/logs.service';
import { LogEntity } from '@/.typeorm/entities/logs.entity';
import { THAI_MONTHS } from '../interfaces/date.formatter';
import { CategoriesFilters } from '../../mission/habit/interfaces/habits.interfaces';

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
    // @InjectRepository(UserReadHistory)
    // private userReadHistoryRepository: Repository<UserReadHistory>,
    @InjectRepository(UserHabits)
    private userHabit: Repository<UserHabits>,
    private logsService: LogsService,
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

    return await this.usersRepository.save(user);
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

  async update(
    uid: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
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
      delete cleanedDto.PASSWORD; // Remove from cleanedDto to prevent double-handling
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
    const user = await this.getById(uid);

    if (!user) {
      throw new NotFoundException('user not found, please re-login');
    }

    // loginStats
    // get week start date end date
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const daysToMonday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    start.setDate(today.getDate() - daysToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday

    const loginStats = await this.loginStreakService.getUserLoginHistoryStats(
      uid,
      start,
      end,
    );

    // acheivement
    // let mock first cuz didnt have this features yet!
    const mockAcheivements = [
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
    ];

    // log

    return {
      userInfo: user,
      userLeague: {
        LB_ID: 2,
        LEAGUE_NAME: 'Silver',
        MIN_EXP: 1000,
        MAX_EXP: 2499,
      },
      loginStats: loginStats,
      usersAchievement: mockAcheivements,
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

    const profile = {
      ...userInfo,
      AGE:
        new Date().getFullYear() - new Date(data.YEAR_OF_BIRTH).getFullYear(),
      RISK_ASSESSMENT: risk,
      LOGIN_STATS: streakLogin,
      COMPLETE_RATE: completeRate,
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

    const now = new Date();
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
}
