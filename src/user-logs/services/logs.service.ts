// logs/logs.service.ts
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogEntity, LogType } from '../../typeorm/entities/log.entity';
import { User } from '../../typeorm/entities/user.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntity)
    private logsRepository: Repository<LogEntity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<LogEntity> {
    const user = await this.usersRepository.findOne({
      where: { id: createLogDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createLogDto.userId} not found`,
      );
    }
    const log = this.logsRepository.create({
      ...createLogDto,
      user,
    });
    return await this.logsRepository.save(log);
  }

  async findAll(): Promise<LogEntity[]> {
    return await this.logsRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<LogEntity> {
    const log = await this.logsRepository.findOne({
      where: { lid: id },
      relations: ['user'],
    });
    if (!log) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
    return log;
  }

  async update(id: number, updateLogDto: UpdateLogDto): Promise<LogEntity> {
    const log = await this.findOne(id);
    Object.assign(log, updateLogDto);
    return await this.logsRepository.save(log);
  }

  async remove(id: number): Promise<void> {
    const result = await this.logsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Log with ID ${id} not found`);
    }
  }

  // async getLogsByUserAndType(
  //   userId: number,
  //   type?: LogType,
  // ): Promise<LogEntity[]> {
  //   const user = await this.usersRepository.findOne({ where: { id: userId } });
  //   if (!user) {
  //     throw new NotFoundException(`User with ID ${userId} not found`);
  //   }

  //   const whereCondition: any = { user: { id: userId } };
  //   if (type) {
  //     whereCondition.type = type;
  //   }

  //   return await this.logsRepository.find({
  //     where: whereCondition,
  //     order: {
  //       date: 'DESC',
  //     },
  //   });
  // }

  async getLogsByUserAndType(
    userId: number,
    type?: LogType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<LogEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const whereCondition: any = { user: { id: userId } };
    if (type) {
      whereCondition.type = type;
    }

    if (startDate || endDate) {
      whereCondition.date = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setUTCHours(0, 0, 0, 0);
        whereCondition.date = MoreThanOrEqual(start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        whereCondition.date =
          endDate === startDate
            ? Between(whereCondition.date, end)
            : LessThanOrEqual(end);
      }
    }

    return await this.logsRepository.find({
      where: whereCondition,
      order: { date: 'DESC', lid: 'DESC' },
    });
  }

  async getTodayLogsByUser(
    userId: number,
    type?: LogType,
  ): Promise<LogEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereCondition: any = {
      userId,
      date: Between(today, tomorrow),
    };

    if (type) {
      whereCondition.type = type;
    }

    return this.logsRepository.find({
      where: whereCondition,
      order: { date: 'DESC', lid: 'DESC' },
    });
  }

  async getWeeklyLogsByUser(
    userId: number,
    startDate: string,
    type?: LogType,
  ): Promise<LogEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      throw new BadRequestException('Invalid start date');
    }

    // Ensure start date is set to the beginning of the day
    start.setUTCHours(0, 0, 0, 0);

    // Calculate the end of the week (7 days from start date)
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    end.setUTCHours(23, 59, 59, 999);

    const whereCondition: any = {
      userId,
      date: Between(start, end),
    };

    if (type) {
      whereCondition.type = type;
    }
 
    return this.logsRepository.find({
      where: whereCondition,
      order: { date: 'DESC', lid: 'DESC' },
    });
  }
}
