import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAchievementDto } from '../dto/create-achievement.dto';
import { UpdateAchievementDto } from '../dto/update-achievement.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Achievement,
  AchievementType,
} from '@/.typeorm/entities/achievement.entity';
import { Repository } from 'typeorm';
import { ImageService } from '../../image/image.service';
import { AchievementLevel } from '@/.typeorm/entities/achievement_level.entity';
import { UserAchieved } from '../../.typeorm/entities/user_achieved.entity';

interface TrackAchievementDto {
  uid: number;
  entity: string;
  property: string;
  value: number;
  date: Date;
}

@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private achievement: Repository<Achievement>,
    @InjectRepository(AchievementLevel)
    private achievementLevel: Repository<AchievementLevel>,
    @InjectRepository(UserAchieved)
    private userAchieved: Repository<UserAchieved>,
    private readonly imageService: ImageService,
  ) {}

  async create(dto: CreateAchievementDto, file?: Express.Multer.File) {
    // Handle file upload
    if (file) {
      dto.ICON_URL = this.imageService.getImageUrl(file.filename);
    }

    // Create and save achievement
    const instance = this.achievement.create(dto);
    const achievement = await this.achievement.save(instance);

    // Handle levels for leveled achievements
    if (
      dto.ACHIEVEMENTS_TYPE === AchievementType.LEVELED &&
      dto.levels.length > 0
    ) {
      const levelData = dto.levels.map((l) => ({
        ACH_ID: achievement.ACH_ID,
        LEVEL: l.LEVEL,
        TARGET_VALUE: l.TARGET_VALUE,
        REWARDS: l.REWARDS,
      }));

      // Save all levels
      await this.achievementLevel.save(levelData);
    }

    return achievement;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    searchTitle?: string;
  }) {
    const { page = 1, limit = 10, searchTitle } = query;
    const queryBuilder = this.achievement
      .createQueryBuilder('ach')
      .select([
        'ach.ACH_ID',
        'ach.TITLE',
        'ach.DESCRIPTION',
        'ach.ACHIEVEMENTS_TYPE',
      ]);

    if (searchTitle) {
      queryBuilder.where('ach.TITLE LIKE :title', { title: searchTitle });
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

  async findOne(id: string) {
    const ach = await this.achievement.findOne({
      where: {
        ACH_ID: id,
      },
    });

    return ach;
  }

  async update(
    id: string,
    dto: UpdateAchievementDto,
    file?: Express.Multer.File,
  ) {
    const ach = await this.findOne(id);
    if (!ach) {
      throw new NotFoundException(`not found acheivement with id: ${id}`);
    }

    if (file) {
      dto.ICON_URL = this.imageService.getImageUrl(file.filename);
    }
  }

  async remove(id: string): Promise<{ message: string; success: boolean }> {
    const result = await this.achievement.delete({ ACH_ID: id });

    if (result.affected === 0) {
      throw new NotFoundException(`Achievement with id ${id} not found`);
    }

    return {
      message: `Achievement with ${id} successfully deleted`,
      success: true,
    };
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

    // todo: check for progress type so we know how to process
    // switch(ach.REQUIREMENT.TRACKING_TYPE) {
    //   case
    // }
  }
}
