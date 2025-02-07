import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLoginStreakDto } from '../dto/create-login-streak.dto';
import { UpdateLoginStreakDto } from '../dto/update-login-streak.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Not, Repository } from 'typeorm';
import { LoginStreakEntity } from '@/.typeorm/entities/login-streak.entity';
import { LoginHistory } from '@/.typeorm/entities/login-history.entity';

// interface DailyLoginStatus {
//   date: string; // ISO date string (YYYY-MM-DD)
//   hasLogin: boolean;
//   loginCount: number;
// }

// interface LoginHistoryStats {
//   dailyStatus: DailyLoginStatus[];
//   totalLogins: number;
//   uniqueDaysLoggedIn: number;
//   totalDaysInPeriod: number;
//   loginPercentage: number;
// }

@Injectable()
export class LoginStreakService {
  constructor(
    @InjectRepository(LoginStreakEntity)
    private loginStreakReposity: Repository<LoginStreakEntity>,
    @InjectRepository(LoginHistory)
    private loginHistoryReposity: Repository<LoginHistory>,
  ) {}

  async createLoginStreak(
    createLoginStreakDto: CreateLoginStreakDto,
  ): Promise<LoginStreakEntity> {
    const existLoginStreak = await this.findOne(+createLoginStreakDto.UID);

    if (existLoginStreak) {
      throw new ConflictException(
        `Login streak already exists for this UID ${createLoginStreakDto.UID}`,
      );
    }

    const today = new Date();

    this.createLoginHistory(createLoginStreakDto.UID, today);

    const loginStreak = this.loginStreakReposity.create({
      ...createLoginStreakDto,
      STREAK_START_DATE: today,
      LAST_LOGIN_DATE: today,
      CURRENT_STREAK: 1,
      LONGEST_STREAK: 1,
    });

    return await this.loginStreakReposity.save(loginStreak);
  }

  private async createLoginHistory(
    uid: number,
    loginDate: Date,
  ): Promise<LoginHistory> {
    const loginHistory = this.loginHistoryReposity.create({
      UID: uid,
      LOGIN_DATE: loginDate,
    });
    return await this.loginHistoryReposity.save(loginHistory);
  }

  async getUserLoginHistory(uid: number, startDate?: Date, endDate?: Date) {
    const whereClause: any = { UID: uid };

    if (startDate && endDate) {
      whereClause.LOGIN_DATE = Between(startDate, endDate);
    }

    return await this.loginHistoryReposity.find({
      where: whereClause,
      relations: ['USER'],
      order: { LOGIN_DATE: 'DESC' },
    });
  }

  async getUserLoginHistoryStats(uid: number, startDate: Date, endDate: Date) {
    // Get all logins within the date range
    const logins = await this.loginHistoryReposity.find({
      where: {
        UID: uid,
        LOGIN_DATE: Between(startDate, endDate),
      },
      order: { LOGIN_DATE: 'ASC' },
    });

    // Create a map of dates with login counts
    const loginsByDate = new Map<string, number>();
    logins.forEach((login) => {
      const dateStr = this.formatDate(this.getStartOfDay(login.LOGIN_DATE));
      loginsByDate.set(dateStr, (loginsByDate.get(dateStr) || 0) + 1);
    });

    // Generate array of all dates in range with login status
    const dailyStatus = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = this.formatDate(currentDate);
      const loginCount = loginsByDate.get(dateStr) || 0;

      dailyStatus.push({
        date: dateStr,
        hasLogin: loginCount > 0,
        loginCount,
      });

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const totalDays = dailyStatus.length;
    const uniqueDaysLoggedIn = Array.from(loginsByDate.keys()).length;

    return {
      dailyStatus,
      totalLogins: logins.length,
      uniqueDaysLoggedIn,
      totalDaysInPeriod: totalDays,
      loginPercentage: Math.round((uniqueDaysLoggedIn / totalDays) * 100),
    };
  }

  async findAll() {
    return await this.loginStreakReposity.find({
      relations: ['USER'],
    });
  }

  async remove(uid: number) {
    const loginStreak = await this.findOne(uid);
    return await this.loginStreakReposity.remove(loginStreak);
  }

  async findOne(uid: number) {
    const loginStreak = await this.loginStreakReposity.findOne({
      where: { UID: uid },
      relations: ['USER'],
    });

    if (!loginStreak) {
      throw new NotFoundException(`login Streak with UID:${uid} not found`);
    }

    return loginStreak;
  }

  async update(uid: number, updateLoginStreakDto: UpdateLoginStreakDto) {
    const loginStreak = await this.findOne(+uid);
    if (!loginStreak) {
      throw new NotFoundException(`login Streak with UID:${uid} not found`);
    }

    Object.assign(loginStreak, updateLoginStreakDto);
    return await this.loginStreakReposity.save(loginStreak);
  }

  async updateUserLoginStreak(uid: number) {
    const loginStreak: LoginStreakEntity = await this.findOne(uid).catch(
      (error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }
        return null;
      },
    );

    const today = new Date();
    await this.createLoginHistory(uid, today);

    if (!loginStreak) {
      const loginStreakDto = new CreateLoginStreakDto();
      loginStreakDto.UID = uid;

      return await this.createLoginStreak(loginStreakDto);
    }

    const lastLogin = new Date(loginStreak.LAST_LOGIN_DATE);

    // If already logged in today, not update streak
    if (
      this.getStartOfDay(today).getTime() ===
      this.getStartOfDay(lastLogin).getTime()
    ) {
      return loginStreak;
    }

    if (this.isConsecutiveDay(lastLogin, today)) {
      loginStreak.CURRENT_STREAK += 1;
      loginStreak.LONGEST_STREAK = Math.max(
        loginStreak.CURRENT_STREAK,
        loginStreak.LONGEST_STREAK,
      );
    } else {
      loginStreak.CURRENT_STREAK = 1;
      loginStreak.STREAK_START_DATE = today;
    }

    loginStreak.LAST_LOGIN_DATE = today;
    return await this.update(uid, loginStreak);
    // return updatedLoginStreak;
  }

  // Helper function to get start of day in user's timezone (get midnight)
  getStartOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Helper function to check if dates are consecutive
  isConsecutiveDay = (date: Date, greaterDate: Date): boolean => {
    const dayDiff = Math.floor(
      (this.getStartOfDay(greaterDate).getTime() -
        this.getStartOfDay(date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return dayDiff === 1;
  };

  // Updated helper method to format dates in ISO format (YYYY-MM-DD)
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
