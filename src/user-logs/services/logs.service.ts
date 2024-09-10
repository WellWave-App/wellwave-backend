// logs/logs.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const user = await this.usersRepository.findOne({ where: { id: createLogDto.userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${createLogDto.userId} not found`);
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
    const log = await this.logsRepository.findOne({ where: { lid: id }, relations: ['user'] });
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

  async getLogsByUserAndType(userId: number, type: LogType): Promise<LogEntity[]> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return await this.logsRepository.find({
      where: {
        user: { id: userId },
        type: type
      },
      order: {
        date: 'DESC'
      }
    });
  }
}