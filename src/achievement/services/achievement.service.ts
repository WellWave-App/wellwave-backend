import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Achievement,
  AchievementType,
  RequirementEntity,
  RequirementTrackingType,
  TrackableProperty,
} from '@/.typeorm/entities/achievement.entity';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { ImageService } from '../../image/image.service';
import { AchievementLevel } from '@/.typeorm/entities/achievement_level.entity';
import { UserAchievementProgress } from '../../.typeorm/entities/user_achievement_progress.entity';
import { AchievementBodyDTO } from '../dto/achievement/create_ach.dto';
import { UpdateAchievementBodyDTO } from '../dto/achievement/update_ach.dto';
import { LeagueType } from '@/leagues/enum/lagues.enum';
import { User } from '@/.typeorm/entities/users.entity';
import { HabitStatus } from '@/.typeorm/entities/user-habits.entity';
import { QuestStatus } from '@/.typeorm/entities/user-quests.entity';
import { UserAchieved } from '@/.typeorm/entities/user_achieved.entity';
import { NotificationHistoryService } from '@/notification_history/notification_history.service';

interface TrackAchievementDto {
  uid: number;
  entity: RequirementEntity;
  property: TrackableProperty;
  value: number;
  current_league?: LeagueType;
  date: Date;
}

@Injectable()
export class AchievementService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Achievement)
    private achievement: Repository<Achievement>,
    @InjectRepository(AchievementLevel)
    private achievementLevel: Repository<AchievementLevel>,
    @InjectRepository(UserAchievementProgress)
    private userAchievementProgress: Repository<UserAchievementProgress>,
    @InjectRepository(UserAchieved)
    private userAchieved: Repository<UserAchieved>,
    @InjectRepository(User)
    private user: Repository<User>,
    private readonly imageService: ImageService,
    private readonly notiService: NotificationHistoryService,
    // private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: AchievementBodyDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create achievement
      const achievement = this.achievement.create({
        TITLE: dto.TITLE,
        DESCRIPTION: dto.DESCRIPTION,
        ACHIEVEMENTS_TYPE: dto.ACHIEVEMENTS_TYPE,
        REQUIREMENT: dto.REQUIREMENT,
        TIME_CONSTRAINT: dto.TIME_CONSTRAINT,
        PREREQUISITES: dto.PREREQUISITES,
      });

      const savedAchievement = await queryRunner.manager.save(achievement);

      // Handle levels
      if (dto.levels?.length > 0) {
        // Check for duplicate levels
        const levelNumbers = dto.levels.map((l) => l.LEVEL);
        if (new Set(levelNumbers).size !== levelNumbers.length) {
          throw new BadRequestException(
            'Duplicate level numbers are not allowed',
          );
        }

        const levelData = dto.levels.map((l) => {
          let url;
          if (l.file) {
            url = this.imageService.getImageUrl(l.file.filename);
          }
          return {
            ACH_ID: savedAchievement.ACH_ID,
            LEVEL: l.LEVEL,
            TARGET_VALUE: l.TARGET_VALUE,
            TARGET_LEAGUE: l.TARGET_LEAGUE,
            REWARDS: l.REWARDS,
            ICON_URL: url || null,
          };
        });

        await queryRunner.manager.save(AchievementLevel, levelData);
      }

      await queryRunner.commitTransaction();

      return await this.findOne(savedAchievement.ACH_ID);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Clean up any uploaded files on failure
      await Promise.all(
        dto.levels.map(async (l) => {
          if (l.file) {
            await this.imageService.deleteImage(l.file.filename);
          }
        }),
      );

      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid achievement data');
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: { page?: number; limit?: number; title?: string }) {
    const { page = 1, limit = 10, title: searchTitle } = query;
    const queryBuilder = this.achievement
      .createQueryBuilder('ach')
      .leftJoinAndSelect('ach.levels', 'levels')
      .select([
        'ach.ACH_ID',
        'ach.TITLE',
        'ach.DESCRIPTION',
        'ach.ACHIEVEMENTS_TYPE',
        'levels.LEVEL',
        'levels.REWARDS',
      ])
      .orderBy({
        'ach.TITLE': 'ASC',
        'levels.LEVEL': 'ASC',
      });

    if (searchTitle) {
      queryBuilder.where('LOWER(ach.TITLE) LIKE LOWER(:title)', {
        title: `%${searchTitle}%`,
      });
    }

    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .limit(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Achievement> {
    const achievement = await this.achievement.findOne({
      where: { ACH_ID: id },
      relations: ['levels'],
    });

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${id} not found`);
    }

    return achievement;
  }

  async findOneOrNull(id: string) {
    const ach = await this.achievement.findOne({
      where: {
        ACH_ID: id,
      },
      relations: ['levels'],
    });

    return ach;
  }

  async update(achId: string, dto: UpdateAchievementBodyDTO) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if achievement exists
      const existingAchievement = await this.findOneOrNull(achId);

      if (!existingAchievement) {
        throw new NotFoundException(`Achievement with ID ${achId} not found`);
      }

      // Update achievement basic info
      await queryRunner.manager.update(Achievement, achId, {
        TITLE: dto.TITLE,
        DESCRIPTION: dto.DESCRIPTION,
        ACHIEVEMENTS_TYPE: dto.ACHIEVEMENTS_TYPE,
        REQUIREMENT: dto.REQUIREMENT,
        TIME_CONSTRAINT: dto.TIME_CONSTRAINT,
        PREREQUISITES: dto.PREREQUISITES,
      });

      // Store old icon URLs for cleanup
      const oldIconUrls = existingAchievement.levels.map((l) => l.ICON_URL);

      // Delete existing levels
      await queryRunner.manager.delete(AchievementLevel, {
        ACH_ID: achId,
        // LEVEL: dto.levels[0].LEVEL,
      });

      // Create new levels
      if (dto.levels?.length > 0) {
        const levelData = await Promise.all(
          dto.levels.map(async (l) => {
            let iconUrl = l.ICON_URL; // Keep existing URL if no new file
            if (l.file) {
              iconUrl = this.imageService.getImageUrl(l.file.filename);
            }

            return {
              ACH_ID: achId,
              LEVEL: l.LEVEL,
              TARGET_VALUE: l.TARGET_VALUE,
              TARGET_LEAGUE: l.TARGET_LEAGUE,
              REWARDS: l.REWARDS,
              ICON_URL: iconUrl,
            };
          }),
        );

        await queryRunner.manager.save(AchievementLevel, levelData);
      }

      await queryRunner.commitTransaction();

      // Clean up old images after successful update
      await Promise.all(
        oldIconUrls.map(async (url) => {
          if (url) {
            await this.imageService.deleteImageByUrl(url);
          }
        }),
      );

      return await this.findOne(achId);
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // Clean up any new uploaded files on failure
      await Promise.all(
        dto.levels.map(async (l) => {
          if (l.file) {
            await this.imageService.deleteImage(l.file.filename);
          }
        }),
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(achId: string) {
    const achievement = await this.findOneOrNull(achId);

    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achId} not found`);
    }

    const iconUrls = achievement.levels
      .map((level) => level.ICON_URL)
      .filter((url) => url);

    // Delete the achievement (auto cascade to levels)
    await this.achievement.remove(achievement);

    // Clean up associated images
    await Promise.all(
      iconUrls.map((url) => this.imageService.deleteImageByUrl(url)),
    );

    return {
      message: `Achievement ${achievement.TITLE} has been successfully deleted`,
      id: achId,
    };
  }

  async findAchievementLevels(
    achievementId: string,
  ): Promise<AchievementLevel[]> {
    const levels = await this.achievementLevel.find({
      where: { ACH_ID: achievementId },
      order: { LEVEL: 'ASC' },
      relations: ['achievement'],
    });

    if (!levels.length) {
      throw new NotFoundException(
        `No levels found for achievement ${achievementId}`,
      );
    }

    return levels;
  }

  async trackProgress(dto: TrackAchievementDto) {
    // todo: find relevent achms for tracking event
    const achievements = await this.achievement.find({
      where: {
        REQUIREMENT: {
          FROM_ENTITY: dto.entity,
          TRACK_PROPERTY: dto.property,
        },
      },
      relations: ['levels'],
    });

    const validAchievements = await Promise.all(
      achievements.map(async (ach) =>
        (await this.validateContraint(ach, dto)) ? ach : null,
      ),
    );

    for (const ach of validAchievements) {
      await this.processProgress(ach, dto);
    }
  }

  async processProgress(ach: Achievement, dto: TrackAchievementDto) {
    let userAchievementProgress = await this.userAchievementProgress.findOne({
      where: {
        ACH_ID: ach.ACH_ID,
        UID: dto.uid,
      },
    });

    if (!userAchievementProgress) {
      userAchievementProgress = this.userAchievementProgress.create({
        UID: dto.uid,
        ACH_ID: ach.ACH_ID,
        CURRENT_LEVEL: 0,
        PROGRESS_VALUE: 0,
      });
    }

    // todo: progress update
    // *-check tracking type to update target value
    switch (ach.REQUIREMENT.TRACKING_TYPE) {
      case RequirementTrackingType.CUMULATIVE:
        userAchievementProgress.PROGRESS_VALUE += dto.value;
        break;
      case RequirementTrackingType.MILESTONE:
        userAchievementProgress.PROGRESS_VALUE = dto.value;
        break;
      case RequirementTrackingType.STREAK:
        if (
          this.isConsecutiveDay(userAchievementProgress.updatedAt, dto.date)
        ) {
          userAchievementProgress.PROGRESS_VALUE += 1;
        } else {
          userAchievementProgress.PROGRESS_VALUE = 1;
        }
        break;
      case RequirementTrackingType.HIGH_SCORE:
        userAchievementProgress.PROGRESS_VALUE = Math.max(
          userAchievementProgress.PROGRESS_VALUE,
          dto.value,
        );
        break;
    }

    // *check if user met the target value? on user current level
    const nextLevel = ach.levels.find(
      (l) => l.LEVEL === userAchievementProgress.CURRENT_LEVEL + 1,
    );

    if (
      nextLevel &&
      this.isLevelUp(ach, userAchievementProgress, nextLevel, dto)
    ) {
      // * (cumulative, streak):  level up when progress >= target_value
      // * (milestone): level up when progress == target_value
      userAchievementProgress.CURRENT_LEVEL += 1;
      userAchievementProgress.ACHIEVED_DATE = new Date(
        new Date().toLocaleString('en-US', {
          timeZone: 'Asia/Bangkok',
        }),
      );
      // Emit achievement unlocked event
      await this.achievementUnlocked(userAchievementProgress);
    }
  }

  private async achievementUnlocked(
    userAchievementProgress: UserAchievementProgress,
  ): Promise<void> {
    // todo: add to user achived then add noti
    const userAchieved = await this.userAchieved.findOne({
      where: {
        UID: userAchievementProgress.UID,
        ACH_ID: userAchievementProgress.ACH_ID,
        LEVEL: userAchievementProgress.CURRENT_LEVEL,
      },
    });

    if (userAchieved) {
      try {
        const ach = await this.findOne(userAchievementProgress.ACH_ID);
        throw new ConflictException(
          `user already achieved level ${userAchievementProgress.CURRENT_LEVEL} of ${ach.TITLE}`,
        );
      } catch (error) {
        throw new NotFoundException(error.message);
      }
    }

    const newAchieved = this.userAchieved.create({
      ACH_ID: userAchievementProgress.ACH_ID,
      UID: userAchievementProgress.UID,
      LEVEL: userAchievementProgress.CURRENT_LEVEL,
      ACHIEVED_DATE: userAchievementProgress.ACHIEVED_DATE,
    });

    const unlock = await this.userAchieved.save(newAchieved);
    if (unlock) {
      const data = {
        MESSAGE: `ปลดล็อค${newAchieved.achievment.TITLE} ระดับ${userAchievementProgress.CURRENT_LEVEL}`,
        FROM: `Wellwave`,
        TO: `${newAchieved.UID}`,
        UID: newAchieved.UID,
        IS_READ: false,
        IMAGE_URL:
          newAchieved.achievment.levels[
            userAchievementProgress.CURRENT_LEVEL - 1
          ].ICON_URL || null,
      };

      await this.notiService.create(data);
    }
  }

  private isLevelUp(
    achievement: Achievement,
    userAchievement: UserAchievementProgress,
    nextLevel: AchievementLevel,
    dto: TrackAchievementDto,
  ): boolean {
    switch (achievement.REQUIREMENT.TRACKING_TYPE) {
      case RequirementTrackingType.MILESTONE:
        // For ranks and specific achievements
        return (
          userAchievement.PROGRESS_VALUE === nextLevel.TARGET_VALUE
          // &&
          // (!nextLevel.TARGET_LEAGUE ||
          //   nextLevel.TARGET_LEAGUE === dto.current_league)
        );

      case RequirementTrackingType.CUMULATIVE:
      case RequirementTrackingType.STREAK:
      case RequirementTrackingType.HIGH_SCORE:
        // For accumulating achievements
        return userAchievement.PROGRESS_VALUE >= nextLevel.TARGET_VALUE;

      default:
        return false;
    }
  }

  // *Validate achievement time constraints and prerequisites
  private async validateContraint(ach: Achievement, dto: TrackAchievementDto) {
    // *date out of bound
    if (ach.TIME_CONSTRAINT) {
      const startDate = new Date(ach.TIME_CONSTRAINT.START_DATE);
      const endDate = new Date(ach.TIME_CONSTRAINT.END_DATE);
      if (startDate > dto.date || dto.date > endDate) return false;
    }

    // * user league in exlcude league
    if (ach.REQUIREMENT.EXCLUDE_LEAGUE?.includes(dto.current_league)) {
      return false;
    }

    // * prerquisites check
    if (ach.PREREQUISITES) {
      if (ach.PREREQUISITES.REQUIRED_MISSIONS > 0) {
        const user = await this.user.findOne({
          where: { UID: dto.uid },
          relations: ['quests', 'habits'],
        });

        const completedHabit =
          user.habits?.filter((h) => h.STATUS === HabitStatus.Completed)
            .length || 0;
        const completedQuest =
          user.quests?.filter((q) => q.STATUS === QuestStatus.Completed)
            .length || 0;

        if (
          completedHabit + completedQuest <
          ach.PREREQUISITES.REQUIRED_MISSIONS
        ) {
          return false;
        }
      }
    }

    return true;
  }

  // Helper function to get start of day in user's timezone (get midnight)
  private getStartOfDay = (date: Date): Date => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  };

  // Helper function to check if dates are consecutive
  private isConsecutiveDay = (date: Date, greaterDate: Date): boolean => {
    const dayDiff = Math.floor(
      (this.getStartOfDay(greaterDate).getTime() -
        this.getStartOfDay(date).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return dayDiff === 1;
  };
}
