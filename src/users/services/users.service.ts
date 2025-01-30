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
    // private logsService: LogsService,
    private riskCalculator: RiskCalculator,
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
  ) {
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.RiskAssessment', 'risks')
      .leftJoinAndSelect('user.loginStreak', 'login')
      .leftJoinAndSelect('user.habits', 'habit')
      .leftJoinAndSelect('habit.dailyTracks', 'dailyTracks')
      .select([
        'user.UID',
        'user.USERNAME',
        'user.EMAIL',
        'risks.HYPERTENSION',
        'risks.DIABETES',
        'risks.DYSLIPIDEMIA',
        'risks.OBESITY',
        'habit.CHALLENGE_ID',
        'habit.STATUS',
        'habit.DAYS_GOAL',
        'dailyTracks.TRACK_ID',
        'dailyTracks.COMPLETED',
        'login.STREAK_START_DATE',
        'login.LAST_LOGIN_DATE',
        'login.CURRENT_STREAK',
      ])
      .skip((page - 1) * limit)
      .take(limit);
    // .orderBy(`user.${sortBy}`, order);

    if (searchUID) {
      queryBuilder.andWhere('user.USERNAME LIKE :search', {
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
      if (user.RiskAssessment) {
        user.RiskAssessment.DIABETES = RiskCalculator.calculateDiabetesWeight(
          user.RiskAssessment.DIABETES,
        );
        user.RiskAssessment.HYPERTENSION =
          RiskCalculator.calculateHypertensionWeight(
            user.RiskAssessment.DIABETES,
          );
        user.RiskAssessment.DYSLIPIDEMIA =
          RiskCalculator.calculateDyslipidemiaWeight(
            user.RiskAssessment.DYSLIPIDEMIA,
          );
        user.RiskAssessment.OBESITY = RiskCalculator.calculateObesityWeight(
          user.RiskAssessment.OBESITY,
        );
      }

      // * loggin streak
      let loginStreak = 0;
      if (user.loginStreak) {
        const now = new Date();
        const lastLogin = new Date(user.loginStreak.LAST_LOGIN_DATE);
        const daysSinceLastLogin = Math.floor(
          (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
        );

        // If last login was today or yesterday, show positive streak
        if (daysSinceLastLogin <= 1) {
          loginStreak = user.loginStreak.CURRENT_STREAK;
        } else {
          // If more than 1 day has passed, show negative days since last login
          loginStreak = -daysSinceLastLogin;
        }
      }

      const completeRate = this.getCompleteRate(user.habits);

      return {
        UID: user.UID,
        USERNAME: user.USERNAME,
        EMAIL: user.EMAIL,
        RISK_ASSESSMENT: user.RiskAssessment
          ? {
              HYPERTENSION: user.RiskAssessment.HYPERTENSION,
              DIABETES: user.RiskAssessment.DIABETES,
              DYSLIPIDEMIA: user.RiskAssessment.DYSLIPIDEMIA,
              OBESITY: user.RiskAssessment.OBESITY,
            }
          : null,
        COMPLETE_RATE: completeRate || 0,
        LOGIN_STATS: {
          LOGIN_STREAK: loginStreak,
          LASTED_LOGIN: user.loginStreak?.LAST_LOGIN_DATE || null,
          STREAK_START: user.loginStreak?.STREAK_START_DATE || null,
        },
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

  private getCompleteRate(habits: UserHabits[]): number {
    if (!habits || habits.length === 0) return 0;

    let totalDaysGoal = 0;
    let completedTracks = 0;

    habits.forEach((habit) => {
      if (habit.STATUS !== HabitStatus.Cancled) {
        totalDaysGoal += habit.DAYS_GOAL;
        if (habit.dailyTracks && habit.dailyTracks.length > 0) {
          completedTracks += habit.dailyTracks.filter(
            (track) => track.COMPLETED,
          ).length;
        }
      }
    });

    const completeRate =
      totalDaysGoal > 0 ? (completedTracks / totalDaysGoal) * 100 : 0;
    return Number(completeRate.toFixed(2));
  }

  async getDeepProfile(uid: number) {
    
  }
}
