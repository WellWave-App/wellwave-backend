import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly loginStreakService: LoginStreakService,
    private readonly imageService: ImageService,
    @InjectRepository(UserReadHistory)
    private userReadHistoryRepository: Repository<UserReadHistory>,

    // private logsService: LogsService,
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

  // async uploadFile(file: Express.Multer.File) {
  //   if (!file) throw new BadRequestException('invalid file type');

  //   // validate file type
  //   const allowedMimeTypes = ['image/jpeg', 'image/png'];
  //   if (!allowedMimeTypes.includes(file.mimetype)) {
  //     throw new BadRequestException('invalid file type');
  //   }

  //   // validate file size (e.g., max 5mb)
  //   const maxSize = 5 * 1024 * 1024;
  //   if (file.size > maxSize) {
  //     throw new BadRequestException('file is too large!');
  //   }

  //   const pathUrl = this.imageService.getImageUrl(file.filename);

  //   return { message: 'File uploaded successfully', file: file, url: pathUrl };
  // }

  async findSimilarUsers(
    uid: number,
    limit: number = 10,
  ): Promise<{ uid: number; similarity: number }[]> {
    const targetUser = await this.usersRepository.findOne({
      where: { UID: uid },
    });

    const allUsers = await this.usersRepository.find({
      where: { UID: Not(uid) },
    });

    const similarities = await Promise.all(
      allUsers.map(async (user) => {
        const healthSimilarity = this.calculateHealthSimilarity(
          targetUser,
          user,
        );

        const behaviorSimilarity =
          await this.calculateReadingBehaviorCorrelation(uid, user.UID);

        // Combine similarities with weights
        const totalSimilarity =
          healthSimilarity * 0.5 + behaviorSimilarity * 0.5;

        return {
          uid: user.UID,
          similarity: totalSimilarity,
        };
      }),
    );

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  private calculateHealthSimilarity(user1: User, user2: User): number {
    // Create arrays of risk scores for both users
    const user1Scores = [
      user1.HYPERTENSION_RISK,
      user1.DIABETE_RISK,
      user1.DYSLIPIDEMIA_RISK,
      user1.OBESITY_RISK,
    ];

    const user2Scores = [
      user2.HYPERTENSION_RISK,
      user2.DIABETE_RISK,
      user2.DYSLIPIDEMIA_RISK,
      user2.OBESITY_RISK,
    ];

    return this.calculatePearsonCorrelation(user1Scores, user2Scores);
  }

  private async calculateReadingBehaviorCorrelation(
    userId1: number,
    userId2: number,
  ): Promise<number> {
    // Get reading history for both users
    const [user1History, user2History] = await Promise.all([
      this.userReadHistoryRepository.find({ where: { UID: userId1 } }),
      this.userReadHistoryRepository.find({ where: { UID: userId2 } }),
    ]);

    // Create maps for easy lookup
    const user1Scores = new Map<number, number>();
    const user2Scores = new Map<number, number>();

    // Calculate engagement scores for each article
    user1History.forEach((history) => {
      const score = this.calculateEngagementScore(history);
      user1Scores.set(history.AID, score);
    });

    user2History.forEach((history) => {
      const score = this.calculateEngagementScore(history);
      user2Scores.set(history.AID, score);
    });

    // Find common articles
    const commonArticles = [...user1Scores.keys()].filter((articleId) =>
      user2Scores.has(articleId),
    );

    if (commonArticles.length === 0) return 0;

    // Create arrays for correlation calculation
    const user1Values = commonArticles.map((aid) => user1Scores.get(aid) || 0);
    const user2Values = commonArticles.map((aid) => user2Scores.get(aid) || 0);

    return this.calculatePearsonCorrelation(user1Values, user2Values);
  }

  private calculateEngagementScore(history: UserReadHistory): number {
    let score = 0;

    // Weight different engagement factors
    if (history.IS_READ) score += 1;
    if (history.IS_BOOKMARK) score += 2;

    // Add reading progress score (0-1)
    score += (history.READING_PROGRESS || 0) / 100;

    // Add rating score if available (0-5)
    if (history.RATING) {
      score += history.RATING;
    }

    // Calculate recency score (decay over time)
    const daysSinceLastRead = Math.floor(
      (Date.now() - new Date(history.LASTED_READ_DATE).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const recencyScore = Math.exp(-daysSinceLastRead / 30); // 30-day half-life

    return score * recencyScore;
  }

  private calculatePearsonCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0;

    // Calculate means
    const xMean = x.reduce((sum, val) => sum + val, 0) / x.length;
    const yMean = y.reduce((sum, val) => sum + val, 0) / y.length;

    // Calculate covariance and standard deviations
    let covariance = 0;
    let xStdDev = 0;
    let yStdDev = 0;

    for (let i = 0; i < x.length; i++) {
      const xDiff = x[i] - xMean;
      const yDiff = y[i] - yMean;
      covariance += xDiff * yDiff;
      xStdDev += xDiff * xDiff;
      yStdDev += yDiff * yDiff;
    }

    xStdDev = Math.sqrt(xStdDev);
    yStdDev = Math.sqrt(yStdDev);

    // Avoid division by zero
    if (xStdDev === 0 || yStdDev === 0) return 0;

    // Calculate correlation
    const correlation = covariance / (xStdDev * yStdDev);

    // Normalize to range [0,1] instead of [-1,1]
    return (correlation + 1) / 2;
  }

  // Helper method to normalize array values to 0-1 range
  private normalizeArray(arr: number[]): number[] {
    const min = Math.min(...arr);
    const max = Math.max(...arr);
    const range = max - min;

    if (range === 0) return arr.map(() => 0);
    return arr.map((val) => (val - min) / range);
  }
}
