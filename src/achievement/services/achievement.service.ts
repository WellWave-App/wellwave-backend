import {
  BadRequestException,
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
import { UserAchieved } from '../../.typeorm/entities/user_achieved.entity';
import { AchievementBodyDTO } from '../dto/achievement/create_ach.dto';
import { UpdateAchievementBodyDTO } from '../dto/achievement/update_ach.dto';
import { dropdownData } from '../interfaces/dropdown.data';

interface TrackAchievementDto {
  uid: number;
  entity: RequirementEntity;
  property: TrackableProperty;
  value: number;
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
    @InjectRepository(UserAchieved)
    private userAchieved: Repository<UserAchieved>,
    private readonly imageService: ImageService,
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
    const achievments = await this.achievement.find({
      where: {
        REQUIREMENT: {
          FROM_ENTITY: dto.entity,
          TRACK_PROPERTY: dto.property,
        },
      },
      relations: ['levels'],
    });

    for (const ach of achievments) {
      await this.processProgress(ach, dto);
    }
  }

  async processProgress(ach: Achievement, dto: TrackAchievementDto) {
    let userAchieveds = await this.userAchieved.findOne({
      where: {
        ACH_ID: ach.ACH_ID,
        UID: dto.uid,
      },
    });

    if (!userAchieveds) {
      userAchieveds = this.userAchieved.create({
        UID: dto.uid,
        ACH_ID: ach.ACH_ID,
        CURRENT_LEVEL: 0,
        PROGRESS_VALUE: 0,
      });
    }

    // todo: progress update

    // *-if time_contraint not valid -> return (no update progress)
    // *-if prerequisites not valid -> return
    // *-if user current league include in exclude_league -> return
    // *-check tracking type to update target value
    switch (ach.REQUIREMENT.TRACKING_TYPE) {
      case RequirementTrackingType.CUMULATIVE:
        userAchieveds.PROGRESS_VALUE += dto.value;
      case RequirementTrackingType.MILESTONE:
        userAchieveds.PROGRESS_VALUE = dto.value;
      case RequirementTrackingType.STREAK:
        if (this.isConsecutiveDay(userAchieveds.updatedAt, dto.date)) {
          userAchieveds.PROGRESS_VALUE += dto.value;
        } else {
          userAchieveds.PROGRESS_VALUE = 0;
        }
      case RequirementTrackingType.HIGH_SCORE:
        userAchieveds.PROGRESS_VALUE = Math.max(
          userAchieveds.PROGRESS_VALUE,
          dto.value,
        );
    }

    // *check if user met the target value? on user current level
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
