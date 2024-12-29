import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { UserEntity } from '@/.typeorm/entities/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserReadHistoryDto } from '../dto/create-user-read-history.dto';
import {
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../../../users/services/users.service';
import { ArticleService } from '../../article/services/article.service';
import { query } from 'express';
import { PaginatedResponse } from '@/response/response.interface';
import { UpdateUserReadHistoryDto } from '../dto/update-user-read-history.dto';

export class UserReadHistoryReposity {
  constructor(
    @InjectRepository(UserReadHistory)
    private repository: Repository<UserReadHistory>,
    private usersService: UsersService,
    private articleService: ArticleService,
  ) {}

  async create(dto: CreateUserReadHistoryDto): Promise<UserReadHistory> {
    try {
      const newHistory = this.repository.create({
        ...dto,
        FIRST_READ_DATE: new Date(),
        LASTED_READ_DATE: new Date(),
        IS_READ: true,
      });

      return this.repository.save(newHistory);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException(`this history already exists`);
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findById(UID: number, AID: number): Promise<UserReadHistory> {
    const userReadHistory = await this.repository.findOne({
      where: { UID, AID },
      relations: ['user', 'article'],
      select: {
        // Properties from the main entity
        UID: true,
        AID: true,
        IS_READ: true,
        IS_BOOKMARK: true,
        RATING: true,
        FIRST_READ_DATE: true,
        LASTED_READ_DATE: true,
        // Properties from related entities
        user: {
          UID: true,
          EMAIL: true,
          USERNAME: true,
          // other user properties you want to select
        },
        article: {
          AID: true,
          TOPIC: true,
          ESTIMATED_READ_TIME: true,
          THUMBNAIL_URL: true,
          diseases: true,
          // other article properties you want to select
        },
      },
    });

    if (!userReadHistory) {
      throw new NotFoundException(
        `User read history ids aid: ${AID}, uid: ${UID}not found`,
      );
    }

    return userReadHistory;
  }

  async findAll(
    uid?: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserReadHistory>> {
    try {
      const whereCondition = uid ? { UID: uid } : {};

      const history = await this.repository.findAndCount({
        where: whereCondition,
        take: limit,
        skip: (page - 1) * limit,
        order: { LASTED_READ_DATE: 'DESC' },
      });

      return {
        data: history[0],
        meta: {
          total: history[1],
          page: page,
          limit: limit,
          totalPages: Math.ceil(history[1] / limit),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch user read history',
      );
    }
  }

  async update(dto: UpdateUserReadHistoryDto): Promise<UserReadHistory> {
    const history = await this.findById(dto.UID, dto.AID);
    try {
      const updated = Object.assign(history, dto);
      return await this.repository.save(updated);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException();
      }
      throw new InternalServerErrorException('Failed to update history');
    }
  }

  async remove(
    UID: number,
    AID: number,
  ): Promise<{ message: string; success: boolean }> {
    const result = await this.repository.delete({ UID, AID });

    if (result.affected === 0) {
      throw new NotFoundException(
        `User read history with uid:${AID},aid${UID} not found`,
      );
    }

    return {
      message: `User read history with aid: ${AID}, uid: ${UID} successfully deleted`,
      success: true,
    };
  }

  async findBookmarkedArticles(
    uid: number,
  ): Promise<PaginatedResponse<UserReadHistory>> {
    try {
      const bookmarks = await this.repository.findAndCount({
        where: {
          UID: uid,
          IS_BOOKMARK: true,
        },
        relations: ['article'],
        order: {
          LASTED_READ_DATE: 'DESC',
        },
        select: {
          // Properties from the main entity
          UID: true,
          AID: true,
          IS_READ: true,
          IS_BOOKMARK: true,
          RATING: true,
          FIRST_READ_DATE: true,
          LASTED_READ_DATE: true,
          // Properties from related entities
          user: {
            UID: true,
            EMAIL: true,
            USERNAME: true,
          },
          article: {
            AID: true,
            TOPIC: true,
            ESTIMATED_READ_TIME: true,
            THUMBNAIL_URL: true,
          },
        },
      });

      return { data: bookmarks[0], meta: { total: bookmarks[1] } };
    } catch (error) {}
  }
}
