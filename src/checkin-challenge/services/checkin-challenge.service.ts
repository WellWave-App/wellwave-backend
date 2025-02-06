import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCheckinChallengeDto } from '../dto/create-checkin-challenge.dto';
import { UpdateCheckinChallengeDto } from '../dto/update-checkin-challenge.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CheckInChallenge,
  CheckinRewards,
} from '@/.typeorm/entities/checkin-challenge.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CheckinChallengeService {
  constructor(
    @InjectRepository(CheckInChallenge)
    private repository: Repository<CheckInChallenge>,
  ) {}

  async create(dto: CreateCheckinChallengeDto) {
    const exist = await this.findOne(dto.UID);
    if (exist) {
      throw new ConflictException();
    }

    const checkin = this.repository.create(dto);
    return await this.repository.save(checkin);
  }

  // findAll() {}

  async findOne(uid: number) {
    const checkIn = await this.repository.findOne({
      where: { UID: uid },
      // relations: ['user'],
    });

    return checkIn;
  }

  async update(dto: UpdateCheckinChallengeDto) {
    const checkin = await this.findOne(+dto.UID);
    if (!checkin) {
      throw new NotFoundException(`instance with UID:${dto.UID} not found`);
    }

    Object.assign(checkin, dto);
    return await this.repository.save(checkin);
  }

  async remove(uid: number) {
    const checkin = await this.findOne(uid);
    return await this.repository.remove(checkin);
  }

  async updateTodayCheckin(uid: number, date: Date) {
    let checkin = await this.findOne(uid);
    const checkinDate = new Date(date);

    if (!checkin) {
      // * first time check in of user
      checkin = await this.create({
        UID: uid,
        STREAK_START_DATE: checkinDate,
        LAST_LOGIN_DATE: checkinDate,
        CURRENT_STREAK: 1,
        LONGEST_STREAK: 1,
        TOTAL_POINTS_EARNED: this.getRewardDay(1),
      });
      // TODO: implement reward service
      return await this.getStats(uid);
    }

    // Check if already checked in today
    const lastLoginDay = this.getStartOfDay(new Date(checkin.LAST_LOGIN_DATE));
    const currentDay = this.getStartOfDay(checkinDate);

    if (lastLoginDay.getDate() === currentDay.getDate()) {
      throw new ConflictException('Already checked in today');
    }

    // *check is current date login is consecutive ? update streak : reset srteak
    const lastedDate = new Date(checkin.LAST_LOGIN_DATE);
    if (this.isConsecutiveDay(lastedDate, checkinDate)) {
      // checkin.STREAK_START_DATE stay the same
      checkin.CURRENT_STREAK += 1;
      if (checkin.CURRENT_STREAK > 7) {
        checkin.CURRENT_STREAK = 1;
        checkin.STREAK_START_DATE = checkinDate;
      }
      // * update longest streak
      if (checkin.CURRENT_STREAK > checkin.LONGEST_STREAK) {
        checkin.LONGEST_STREAK = checkin.CURRENT_STREAK;
      }
    } else {
      // reset if user breaks streak
      checkin.CURRENT_STREAK = 1;
      checkin.STREAK_START_DATE = checkinDate;
    }

    // TODO: reward user for today streak
    checkin.TOTAL_POINTS_EARNED += this.getRewardDay(checkin.CURRENT_STREAK);
    checkin.LAST_LOGIN_DATE = checkinDate;
    // implement reward service to update user exp or gem

    await this.update(checkin);
    return await this.getStats(uid);
  }

  async getStats(uid: number) {
    const checkin = await this.findOne(uid);
    if (!checkin) {
      const defaultStats = Array.from({ length: 7 }, (_, index) => ({
        day: index + 1,
        isLogin: false,
        rewardAmount: this.getRewardDay(index + 1),
      }));

      return {
        checkInStats: defaultStats,
        overallStats: {
          UID: uid,
          STREAK_START_DATE: null,
          LAST_LOGIN_DATE: null,
          CURRENT_STREAK: 0,
          LONGEST_STREAK: 0,
          TOTAL_POINTS_EARNED: 0,
          LAST_UPDATED: null,
        },
      };
    }

    // Check if streak should be reset
    const lastLoginDay = this.getStartOfDay(new Date(checkin.LAST_LOGIN_DATE));
    const today = this.getStartOfDay(new Date());
    const dayDiff = Math.floor(today.getDate() - lastLoginDay.getDate());

    // If more than 1 day has passed, reset streak
    let currentStreak = checkin.CURRENT_STREAK;
    if (dayDiff > 1) {
      currentStreak = 0; // Set to 0 since they haven't checked in today yet

      // Update the database with reset streak
      await this.repository.update(checkin.UID, {
        CURRENT_STREAK: 0,
        STREAK_START_DATE: today,
      });
    }

    // Generate checkin stats for 7 days
    const checkInStats = Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      return {
        day,
        isLogin: day <= currentStreak,
        rewardAmount: this.getRewardDay(day),
      };
    });

    return {
      checkInStats,
      overallStats: {
        ...checkin,
        CURRENT_STREAK: currentStreak,
      },
    };
  }

  private getStartOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  private isConsecutiveDay = (date: Date, greaterDate: Date): boolean => {
    const dayDiff = Math.floor(
      (this.getStartOfDay(greaterDate).getTime() -
        this.getStartOfDay(date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return dayDiff === 1;
  };

  private getRewardDay(day: number) {
    const rewardsArray = Object.values(CheckinRewards).filter(
      (value) => typeof value === 'number',
    );
    return rewardsArray[day - 1];
  }
}
