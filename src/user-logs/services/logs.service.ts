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
import { LogEntity, LOG_NAME } from '../../typeorm/entities/logs.entity';
import { UserEntity } from '../../typeorm/entities/users.entity';

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

    const date = createLogDto.DATE || new Date();

    // Check for existing log entry
    const existingLog = await this.logsRepository.findOne({
      where: {
        UID: user.UID,
        DATE: date,
        LOG_NAME: createLogDto.LOG_NAME,
      },
    });

    if (existingLog) {
      throw new ConflictException(
        `A log entry for ${createLogDto.LOG_NAME} on ${date} already exists for this user.`,
      );
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
          `A log entry for ${createLogDto.LOG_NAME} on ${date} already exists for this user.`,
        );
      }
      throw error;
    }
  }

  async update(lid: number, updateLogDto: UpdateLogDto): Promise<LogEntity> {
    const log = await this.findOne(lid);
    Object.assign(log, updateLogDto);
    return await this.logsRepository.save(log);
  }

  async remove(lid: number): Promise<{ message: string; success: boolean }> {
    const result = await this.logsRepository.delete(lid);
    if (result.affected === 0) {
      throw new NotFoundException(`Log with ID ${lid} not found`);
    }

    return {
      message: `Log with LID ${lid} successfully deleted`,
      success: true,
    };
  }

  async findAll(): Promise<{ LOGS: LogEntity[] }> {
    const LOGS = await this.logsRepository.find();
    return { LOGS }; // Return logs in the object
  }

  async findOne(lid: number): Promise<LogEntity> {
    const log = await this.logsRepository.findOne({
      where: { LID: lid },
      relations: ['USER'],
    });
    if (!log) {
      throw new NotFoundException(`Log with ID ${lid} not found`);
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

    const whereCondition: any = { USER: { UID: uid } };
    if (logName) {
      whereCondition.LOG_NAME = logName;
    }

    if (startDate && endDate) {
      whereCondition.DATE = Between(new Date(startDate), new Date(endDate));
    } else if (startDate) {
      whereCondition.DATE = Between(new Date(startDate), new Date());
    } else if (endDate) {
      whereCondition.DATE = Between(new Date('1970-01-01'), new Date(endDate));
    }

    const LOGS = await this.logsRepository.find({
      where: whereCondition,
      order: { DATE: 'DESC', LID: 'DESC' },
    });

    return { LOGS }; // Return logs in the object
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
      order: { DATE: 'DESC', LID: 'DESC' },
    });

    return { LOGS }; // Return logs in the object
  }

  async getWeeklyLogsByUser(
    uid: number,
    date: string, // date format: 'YYYY-MM-DD'
    logName?: LOG_NAME,
  ): Promise<{ LOGS: LogEntity[] }> {
    // Fetch user from the database
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    // Convert string date to Date object
    const inputDate = new Date(date);
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
      order: { DATE: 'DESC', LID: 'DESC' },
    });

    return { LOGS }; // Return logs in an object
  }
}
