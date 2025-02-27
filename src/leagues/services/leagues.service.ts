import { UserLeaderboard } from '@/.typeorm/entities/user-leaderboard.entity';
import { UsersService } from '@/users/services/users.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeagueType } from '../enum/lagues.enum';
import {
  HabitStatus,
  UserHabits,
} from '@/.typeorm/entities/user-habits.entity';
import { CreateUserLeagderboardDto } from '../dto/create-league.dto';
import { ContextUtils } from '@nestjs/core/helpers/context-utils';
import { User } from '@/.typeorm/entities/users.entity';
import { DateService } from '@/helpers/date/date.services';
import { AchievementService } from '@/achievement/services/achievement.service';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(UserLeaderboard)
    private leaderboardRepo: Repository<UserLeaderboard>,
    private dateService: DateService,
    private achievementService: AchievementService,
  ) {}

  private leagueOrder = [
    LeagueType.NONE,
    LeagueType.BRONZE,
    LeagueType.SILVER,
    LeagueType.GOLD,
    LeagueType.EMERALD,
    LeagueType.DIAMOND,
  ];

  private getNextLeague(currentLeague: LeagueType): LeagueType | null {
    const currentIndex = this.leagueOrder.indexOf(currentLeague);
    return currentIndex < this.leagueOrder.length - 1
      ? this.leagueOrder[currentIndex + 1]
      : null;
  }

  private getPreviousLeague(currentLeague: LeagueType): LeagueType | null {
    const currentIndex = this.leagueOrder.indexOf(currentLeague);
    return currentIndex > 0 ? this.leagueOrder[currentIndex - 1] : null;
  }

  async updateGroupAssignments(league: LeagueType): Promise<void> {
    if (league === LeagueType.NONE) return;
    // Get all users in the specified league, ordered by exp
    const users = await this.leaderboardRepo.find({
      where: { CURRENT_LEAGUE: league },
      order: { CURRENT_EXP: 'DESC' },
    });

    // Define group size constraints
    const minGroupSize = 7;
    const maxGroupSize = 13;
    const idealGroupSize = 10;

    // Calculate groups based on min/max constraints
    const maxGroups = Math.floor(users.length / minGroupSize);
    const minGroups = Math.ceil(users.length / maxGroupSize);
    const idealGroups = Math.round(users.length / idealGroupSize);

    // Choose number of groups that's within our constraints and closest to ideal
    // Ensure at least 1 group even for very small user counts
    const totalGroups = Math.max(
      1,
      Math.min(
        maxGroups || 1, // Ensure maxGroups is at least 1
        Math.max(minGroups, Math.min(maxGroups, idealGroups)),
      ),
    );

    // Calculate base group size and remainder
    const baseGroupSize = Math.floor(users.length / totalGroups);
    const remainder = users.length % totalGroups;

    // Assign users to groups
    const usersWithGroups = users.map((user, index) => {
      let groupNumber;

      if (index < remainder * (baseGroupSize + 1)) {
        // First 'remainder' groups get baseGroupSize + 1 people
        groupNumber = Math.floor(index / (baseGroupSize + 1));
      } else {
        // Remaining groups get baseGroupSize people
        const adjustedIndex = index - remainder * (baseGroupSize + 1);
        groupNumber = Math.floor(adjustedIndex / baseGroupSize) + remainder;
      }

      return { ...user, GROUP_NUMBER: groupNumber };
    });

    // Update all users' group numbers
    await Promise.all(
      usersWithGroups.map((user) =>
        this.leaderboardRepo.update(
          { UID: user.UID },
          { GROUP_NUMBER: user.GROUP_NUMBER },
        ),
      ),
    );
  }

  async biMonthlyReset(): Promise<{ message: string; leagues: any }> {
    // Get all leagues sorted by rank
    const leagues = await this.leaderboardRepo
      .createQueryBuilder('lb')
      .select('DISTINCT lb.CURRENT_LEAGUE')
      .orderBy('lb.CURRENT_LEAGUE', 'ASC')
      .getRawMany();

    // return { message: '', leagues: groups };
    // Process each league
    for (const { CURRENT_LEAGUE } of leagues) {
      // Get users in current league ordered by exp
      const usersInLeague = await this.leaderboardRepo.find({
        where: { CURRENT_LEAGUE },
        order: { CURRENT_EXP: 'DESC' },
      });

      if (CURRENT_LEAGUE === LeagueType.NONE) {
        // todo: check if user have completed habits reached 5 ornot
        await Promise.all(
          usersInLeague.map((ul) => {
            const userCompletedCount =
              ul.user?.habits?.filter((h) => h.STATUS === HabitStatus.Completed)
                .length || 5;

            if (userCompletedCount >= 5) {
              this.leaderboardRepo.update(
                { UID: ul.UID },
                {
                  PREVIOUS_LEAGUE: ul.CURRENT_LEAGUE,
                  PREVIOUS_RANK: null,
                  CURRENT_LEAGUE: LeagueType.BRONZE,
                  CURRENT_EXP: 0,
                  CURRENT_RANK: null, // Will be recalculated,
                  GROUP_NUMBER: null, // Will be reassigned in next league
                },
              );
            }
          }),
        );

        continue;
      }

      // Identify users for promotion and demotion
      const groups = await this.leaderboardRepo
        .createQueryBuilder('lb')
        .select('DISTINCT lb.GROUP_NUMBER')
        .andWhere('lb.CURRENT_LEAGUE = :league', { league: CURRENT_LEAGUE })
        .orderBy('lb.GROUP_NUMBER', 'ASC')
        .getRawMany();

      for (const { GROUP_NUMBER } of groups) {
        const usersInGroups = await this.leaderboardRepo.find({
          where: { CURRENT_LEAGUE, GROUP_NUMBER },
          order: { CURRENT_EXP: 'DESC' },
        });
        const promotionUsers =
          usersInGroups.length > 10
            ? usersInGroups.slice(0, 3)
            : usersInGroups.slice(0, 2); // Top 3
        const demotionUsers =
          usersInGroups.length > 10
            ? usersInGroups.slice(-2)
            : usersInGroups.slice(-1); // Bottom 2

        // Process promotions
        for (const user of promotionUsers) {
          const nextLeague = this.getNextLeague(user.CURRENT_LEAGUE);
          if (nextLeague) {
            await this.leaderboardRepo.update(
              { UID: user.UID },
              {
                PREVIOUS_LEAGUE: user.CURRENT_LEAGUE,
                PREVIOUS_RANK: user.CURRENT_RANK,
                CURRENT_LEAGUE: nextLeague,
                CURRENT_EXP: 0,
                CURRENT_RANK: null, // Will be recalculated,
                GROUP_NUMBER: null, // Will be reassigned in next league
              },
            );
          }
        }

        // Process demotions
        if (usersInGroups.length > 5) {
          for (const user of demotionUsers) {
            const previousLeague = this.getPreviousLeague(user.CURRENT_LEAGUE);
            if (previousLeague && previousLeague !== LeagueType.NONE) {
              await this.leaderboardRepo.update(
                { UID: user.UID },
                {
                  PREVIOUS_LEAGUE: user.CURRENT_LEAGUE,
                  PREVIOUS_RANK: user.CURRENT_RANK,
                  CURRENT_LEAGUE: previousLeague,
                  CURRENT_EXP: 0,
                  CURRENT_RANK: null, // Will be recalculated,
                  GROUP_NUMBER: null, // Will be reassigned in next league
                },
              );
            }
          }
        }
      }
    }

    return await this.resetLeague();
  }

  private async resetLeague() {
    const leagues = await this.leaderboardRepo
      .createQueryBuilder('lb')
      .select('DISTINCT lb.CURRENT_LEAGUE')
      .orderBy('lb.CURRENT_LEAGUE', 'ASC')
      .getRawMany();

    for (const { CURRENT_LEAGUE } of leagues) {
      // Check if any users exist in this league before processing
      await this.updateResetExp(CURRENT_LEAGUE);
      await this.updateGroupAssignments(CURRENT_LEAGUE);
    }

    return {
      message: 'successfully reset',
      leagues,
    };
  }

  private async updateResetExp(league: LeagueType) {
    if (league === LeagueType.NONE) return;

    const users = await this.leaderboardRepo.find({
      where: { CURRENT_LEAGUE: league },
      order: { CURRENT_EXP: 'DESC' },
    });

    await Promise.all(
      users.map((user, index) =>
        this.leaderboardRepo.update(
          { UID: user.UID },
          { CURRENT_EXP: 0, CURRENT_RANK: null, GROUP_NUMBER: null },
        ),
      ),
    );
  }

  private async updateRankings(
    league: LeagueType,
    groupId: number,
  ): Promise<void> {
    const users = await this.leaderboardRepo.find({
      where: { CURRENT_LEAGUE: league, GROUP_NUMBER: groupId },
      order: { CURRENT_EXP: 'DESC' },
    });

    await Promise.all(
      users.map((user, index) =>
        this.leaderboardRepo.update(
          { UID: user.UID },
          { CURRENT_RANK: index + 1 },
        ),
      ),
    );
  }

  async getGroupMembers(league: LeagueType, groupNumber: number) {
    await this.updateRankings(league, groupNumber);

    const data = await this.leaderboardRepo.find({
      where: {
        CURRENT_LEAGUE: league,
        GROUP_NUMBER: groupNumber,
      },
      relations: ['user'],
      select: {
        UID: true,
        // CURRENT_LEAGUE: true,
        CURRENT_RANK: true,
        CURRENT_EXP: true,
        PREVIOUS_LEAGUE: true,
        PREVIOUS_RANK: true,
        user: {
          USERNAME: true,
          EMAIL: true,
          IMAGE_URL: true,
        },
      },
      order: { CURRENT_RANK: 'ASC' },
    });

    return {
      groupId: groupNumber,
      league: league,
      data,
      total: data.length,
    };
  }

  async getUsersLeaderboards(user: User) {
    await this.updateRankings(
      user.league.CURRENT_LEAGUE,
      user.league.GROUP_NUMBER,
    );

    const userLeaderboard = await this.leaderboardRepo.findOne({
      where: {
        UID: user.UID,
      },
      relations: ['user'],
      select: {
        UID: true,
        // CURRENT_LEAGUE: true,
        CURRENT_RANK: true,
        CURRENT_EXP: true,
        PREVIOUS_LEAGUE: true,
        PREVIOUS_RANK: true,
        user: {
          USERNAME: true,
          EMAIL: true,
          IMAGE_URL: true,
        },
      },
    });

    const groupMembers = await this.getGroupMembers(
      user.league.CURRENT_LEAGUE,
      user.league.GROUP_NUMBER,
    );

    const currentDate = new Date(this.dateService.getCurrentDate().date);
    const day = currentDate.getDate();

    let nextReset: Date;
    if (day < 16) {
      nextReset = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        16,
      );
    } else {
      nextReset = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + 1,
        1,
      );
    }

    const dayLeft = this.dateService.dayLeft(currentDate, nextReset);

    return {
      league: user.league.CURRENT_LEAGUE,
      groupId: user.league.GROUP_NUMBER,
      date: {
        current: currentDate,
        nextReset,
        dayLeft,
      },
      userStats: userLeaderboard,
      boardMembers: groupMembers,
    };
  }

  async create(user: User, dto: CreateUserLeagderboardDto) {
    try {
      if (user?.league) return;

      const userHabitsCompleted =
        user?.habits?.filter((uh) => uh.STATUS === HabitStatus.Completed)
          .length || 0;

      dto.CURRENT_LEAGUE =
        userHabitsCompleted <= 5 ? LeagueType.NONE : LeagueType.BRONZE;
      dto.CURRENT_EXP = 0;
      dto.UID = user?.UID || dto.UID;

      const intstance = this.leaderboardRepo.create(dto);
      return await this.leaderboardRepo.save(intstance);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to process request',
      );
    }
  }
}
