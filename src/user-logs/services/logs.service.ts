// logs/logs.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogEntity, LOG_NAME } from '../../.typeorm/entities/logs.entity';
import { UserEntity } from '../../.typeorm/entities/users.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntity)
    private logsRepository: Repository<LogEntity>,
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async create(createLogDto: CreateLogDto): Promise<LogEntity> {
    const user = await this.usersRepository.findOne({
      where: { UID: createLogDto.UID },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${createLogDto.UID} not found`);
    }

    const log = this.logsRepository.create({
      ...createLogDto,
      USER: user,
    });

    try {
      return await this.logsRepository.save(log);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation error code
        throw new ConflictException(
          `A log entry already exists for User ID ${createLogDto.UID}, LOG_NAME ${createLogDto.LOG_NAME}, and DATE ${createLogDto.DATE}`,
        );
      }
      throw error;
    }
  }

  async update(
    uid: number,
    logName: LOG_NAME,
    date: Date,
    updateLogDto: UpdateLogDto,
  ): Promise<LogEntity> {
    const log = await this.findOne(uid, logName, date);
    Object.assign(log, updateLogDto);
    return await this.logsRepository.save(log);
  }

  async remove(
    uid: number,
    logName: LOG_NAME,
    date: Date,
  ): Promise<{ message: string; success: boolean }> {
    const result = await this.logsRepository.delete({
      UID: uid,
      LOG_NAME: logName,
      DATE: date,
    });

    if (result.affected === 0) {
      throw new NotFoundException(
        `Log not found for User ID ${uid}, LOG_NAME ${logName}, and DATE ${date}`,
      );
    }

    return {
      message: `Log successfully deleted for User ID ${uid}, LOG_NAME ${logName}, and DATE ${date}`,
      success: true,
    };
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    LOGS: LogEntity[];
    metadata: { total: number; page: number; limit: number };
  }> {
    const [LOGS, total] = await this.logsRepository.findAndCount({
      order: { DATE: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return {
      LOGS,
      metadata: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(
    uid: number,
    logName: LOG_NAME,
    date: Date,
  ): Promise<LogEntity> {
    const log = await this.logsRepository.findOne({
      where: { UID: uid, LOG_NAME: logName, DATE: date },
      relations: ['USER'],
    });
    if (!log) {
      throw new NotFoundException(
        `Log not found for User ID ${uid}, LOG_NAME ${logName}, and DATE ${date}`,
      );
    }
    return log;
  }

  async getLogsByUserAndType(
    uid: number,
    logName?: LOG_NAME,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{ LOGS: LogEntity[] }> {
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    const whereCondition: any = { UID: uid };
    if (logName) {
      whereCondition.LOG_NAME = logName;
    }

    if (startDate && endDate) {
      whereCondition.DATE = Between(startDate, endDate);
    } else if (startDate) {
      whereCondition.DATE = Between(startDate, new Date());
    } else if (endDate) {
      whereCondition.DATE = Between(new Date('1970-01-01'), endDate);
    }

    const LOGS = await this.logsRepository.find({
      where: whereCondition,
      order: { DATE: 'DESC' },
    });

    return { LOGS };
  }

  async getTodayLogsByUser(
    uid: number,
    logName?: LOG_NAME,
  ): Promise<{ LOGS: LogEntity[] }> {
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const whereCondition: any = {
      UID: uid,
      DATE: Between(today, tomorrow),
    };

    if (logName) {
      whereCondition.LOG_NAME = logName;
    }

    const LOGS = await this.logsRepository.find({
      where: whereCondition,
      order: { DATE: 'DESC' },
    });

    return { LOGS };
  }

  async getWeeklyLogsByUser(
    uid: number,
    date?: string,
    logName?: LOG_NAME,
  ): Promise<{
    LOGS: LogEntity[];
    WeekDateInformation: {
      dateSelected: string;
      startOfWeek: string;
      endOfWeek: string;
    };
  }> {
    // Fetch user from the database
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }
    // Convert string date to Date object
    const inputDate = date ? new Date(date) : new Date();
    if (isNaN(inputDate.getTime())) {
      throw new BadRequestException('Invalid start date');
    }

    // Determine the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
    const dayOfWeek = inputDate.getDay();

    // Calculate the start of the week (Monday)
    const start = new Date(inputDate);
    const daysToMonday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    start.setDate(inputDate.getDate() - daysToMonday); // Move back to Monday

    // Calculate the end of the week (Sunday)
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday

    // Define the query conditions
    const whereCondition: any = {
      UID: uid,
      DATE: Between(start, end), // Look for logs between start and end of the week
      LOG_NAME: Not(In([LOG_NAME.SLEEP_LOG, LOG_NAME.DRINK_LOG])),
    };

    // If logName is provided, add it to the query conditions
    if (logName) {
      whereCondition.LOG_NAME = logName;
    }

    // Fetch logs from the repository based on the conditions
    const LOGS = await this.logsRepository.find({
      where: whereCondition,
      order: { DATE: 'DESC' },
    });

    const WeekDateInformation = {
      dateSelected: date
        ? this.formatDate(new Date(date))
        : this.formatDate(new Date()),
      startOfWeek: this.formatDate(start),
      endOfWeek: this.formatDate(end),
    };

    return { LOGS, WeekDateInformation }; // Return logs in an object
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
