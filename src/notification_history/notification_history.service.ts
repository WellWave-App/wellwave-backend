import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateNotificationDto } from './dto/update-notification_history.dto';
import { NotificationHistory } from '@/.typeorm/entities/notification_history.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNotificationDto } from './dto/create-notification_history.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { NotificationQueryDto } from './dto/notficaiton-query.dto';
import { PaginatedResponse } from '@/response/response.interface';
import { ImageService } from '@/image/image.service';
import { DateService } from '@/helpers/date/date.services';

@Injectable()
export class NotificationHistoryService {
  constructor(
    @InjectRepository(NotificationHistory)
    private notificationRepo: Repository<NotificationHistory>,
    private imageService: ImageService,
    private dateService: DateService,
  ) {}

  async create(
    dto: CreateNotificationDto,
    file?: Express.Multer.File,
  ): Promise<NotificationHistory> {
    if (file) {
      dto.IMAGE_URL = this.imageService.getImageUrl(file.filename);
    }
    const notification = this.notificationRepo.create({
      ...dto,
      createAt: new Date(this.dateService.getCurrentDate().timestamp),
    });
    return await this.notificationRepo.save(notification);
  }

  async findAll(
    uid?: number,
    query?: NotificationQueryDto,
  ): Promise<PaginatedResponse<NotificationHistory>> {
    const { search, page = 1, limit = 7, IS_READ } = query;
    const skip = (page - 1) * limit;

    const queryBuilder =
      this.notificationRepo.createQueryBuilder('notification');
    // .leftJoinAndSelect('notification.user', 'user');
    if (uid) {
      queryBuilder.andWhere('notification.UID = :uid', { uid });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(notification.MESSAGE LIKE :search OR notification.FROM LIKE :search)',
        {
          search: `%${search}%`,
        },
      );
    }

    if (IS_READ !== undefined) {
      queryBuilder.andWhere('notification.IS_READ = :IS_READ', {
        IS_READ: Boolean(IS_READ),
      });
    }

    const [data, total] = await queryBuilder
      .skip(skip)
      .take(limit)
      .orderBy('notification.createAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(notiId: string): Promise<NotificationHistory> {
    const notification = await this.notificationRepo.findOne({
      where: { NOTIFICATION_ID: notiId },
      relations: ['user'],
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${notiId} not found`);
    }

    return notification;
  }

  async update(
    notiId: string,
    dto: UpdateNotificationDto,
    file?: Express.Multer.File,
  ): Promise<NotificationHistory> {
    if (file) {
      dto.IMAGE_URL = this.imageService.getImageUrl(file.filename);
    }
    const notification = await this.findOne(notiId);
    Object.assign(notification, dto);
    return await this.notificationRepo.save(notification);
  }

  async remove(notiId: string): Promise<void> {
    const notification = await this.findOne(notiId);
    await this.notificationRepo.remove(notification);
  }

  async markAsRead(notiId: string): Promise<NotificationHistory> {
    const notification = await this.findOne(notiId);
    notification.IS_READ = true;
    return await this.notificationRepo.save(notification);
  }

  async markAllAsRead(
    userId: number,
  ): Promise<{ message: string; count: number }> {
    const result = await this.notificationRepo
      .createQueryBuilder()
      .update(NotificationHistory)
      .set({ IS_READ: true })
      .where('UID = :userId AND IS_READ = :isRead', { userId, isRead: false })
      .execute();

    return {
      message: 'Marked all notifications as read successfully',
      count: result.affected || 0,
    };
  }
}
