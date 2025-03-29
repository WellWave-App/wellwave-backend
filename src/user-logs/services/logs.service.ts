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
  FindManyOptions,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogEntity, LOG_NAME } from '../../.typeorm/entities/logs.entity';
import { User } from '../../.typeorm/entities/users.entity';
import { DateService } from '../../helpers/date/date.services';

interface LogStandardRange {
  min: number;
  max: number;
  unit: string;
}

export const LOG_STANDARDS: Record<LOG_NAME, LogStandardRange> = {
  [LOG_NAME.HDL_LOG]: { min: 40, max: 60, unit: 'mg/dL' },
  [LOG_NAME.LDL_LOG]: { min: 0, max: 100, unit: 'mg/dL' },
  [LOG_NAME.WEIGHT_LOG]: { min: 18.5, max: 24.9, unit: 'kg/m²' }, // BMI range
  [LOG_NAME.SLEEP_LOG]: { min: 7, max: 9, unit: 'hours' },
  [LOG_NAME.HEART_RATE_LOG]: { min: 60, max: 100, unit: 'bpm' },
  [LOG_NAME.CAL_BURN_LOG]: { min: 150, max: 400, unit: 'kcal' },
  [LOG_NAME.DRINK_LOG]: { min: 8, max: 10, unit: 'glasses' },
  [LOG_NAME.STEP_LOG]: { min: 7000, max: 10000, unit: 'steps' },
  [LOG_NAME.WAIST_LINE_LOG]: { min: 0, max: 90, unit: 'cm' },
  [LOG_NAME.DIASTOLIC_BLOOD_PRESSURE_LOG]: { min: 60, max: 80, unit: 'mm Hg' },
  [LOG_NAME.SYSTOLIC_BLOOD_PRESSURE_LOG]: { min: 90, max: 120, unit: 'mm Hg' },
};

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(LogEntity)
    private logsRepository: Repository<LogEntity>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly dateService: DateService,
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
      whereCondition.DATE = Between(
        startDate,
        new Date(this.dateService.getCurrentDate().date),
      );
    } else if (endDate) {
      whereCondition.DATE = Between(new Date('1970-01-01'), endDate);
    }

    const LOGS = await this.logsRepository.find({
      where: whereCondition,
      order: { DATE: 'ASC' },
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

    const today = new Date(this.dateService.getCurrentDate().date);
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
      order: { DATE: 'ASC' },
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
    const inputDate = date
      ? new Date(date)
      : new Date(this.dateService.getCurrentDate().date);
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
      order: { DATE: 'ASC' },
    });

    const WeekDateInformation = {
      dateSelected: date
        ? this.formatDate(new Date(date))
        : this.formatDate(new Date(this.dateService.getCurrentDate().date)),
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

  async getAllLogs(fromDate: Date, toDate: Date, uid?: number) {
    // Create an object to store logs for each type
    const result: Record<string, any[]> = {
      hdl: [],
      ldl: [],
      weight: [],
      sleep: [],
      heartRate: [],
      calBurn: [],
      drink: [],
      step: [],
      waistLine: [],
      dbp: [],
      sbp: [],
    };

    const whereCondition = uid
      ? { UID: uid, DATE: Between(fromDate, toDate) }
      : { DATE: Between(fromDate, toDate) };

    // Get all logs within the date range
    const logs = await this.logsRepository.find({
      where: whereCondition,
      order: {
        DATE: 'ASC',
      },
    });

    // Group logs by type
    logs.forEach((log) => {
      switch (log.LOG_NAME) {
        case LOG_NAME.HDL_LOG:
          result.hdl.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.LDL_LOG:
          result.ldl.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.WEIGHT_LOG:
          result.weight.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.SLEEP_LOG:
          result.sleep.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.HEART_RATE_LOG:
          result.heartRate.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.CAL_BURN_LOG:
          result.calBurn.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.DRINK_LOG:
          result.drink.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.STEP_LOG:
          result.step.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.WAIST_LINE_LOG:
          result.waistLine.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.DIASTOLIC_BLOOD_PRESSURE_LOG:
          result.dbp.push(this.formatLogEntry(log));
          break;
        case LOG_NAME.SYSTOLIC_BLOOD_PRESSURE_LOG:
          result.sbp.push(this.formatLogEntry(log));
          break;
      }
    });

    return result;
  }

  async getLogsWithStatus(
    fromDate: Date,
    toDate: Date,
    page: number = 1,
    limit: number = 10,
    uid: number,
    sortBy: 'date' | 'log_name' | 'log_status' = 'date',
    order: 'ASC' | 'DESC' = 'ASC',
  ) {
    const skip = (page - 1) * limit;
    const sortConfig = {
      date: 'DATE',
      log_name: 'LOG_NAME',
    };

    // Define base query conditions
    const queryOptions: FindManyOptions<LogEntity> = {
      where: {
        DATE: Between(fromDate, toDate),
        UID: uid,
      },
      skip,
      take: limit,
    };

    // Handle sorting
    if (sortBy === 'log_status') {
      // For log_status, we'll first get the data and sort it after computing the status
      queryOptions.order = {
        DATE: 'ASC', // Default ordering for consistent results
      };

      const [logs, total] =
        await this.logsRepository.findAndCount(queryOptions);
      let formattedLogs = logs.map((log) => this.formatLogWithStatus(log));

      // Sort by status
      formattedLogs = this.sortByStatus(formattedLogs, order);

      const totalPages = Math.ceil(total / limit);

      return {
        data: formattedLogs,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } else {
      // For other fields, we can sort directly in the query
      const sortField = sortConfig[sortBy];
      queryOptions.order = { [sortField]: order };

      const [logs, total] =
        await this.logsRepository.findAndCount(queryOptions);
      const formattedLogs = logs.map((log) => this.formatLogWithStatus(log));
      const totalPages = Math.ceil(total / limit);

      return {
        data: formattedLogs,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    }
  }

  private sortByStatus(logs: any[], order: 'ASC' | 'DESC'): any[] {
    return logs.sort((a, b) => {
      // Extract numerical values from status for comparison
      const getStatusValue = (status: string): number => {
        if (status === 'ผ่านเกณฑ์มาตรฐาน') return 0;
        const match = status.match(/(\d+\.?\d*)/);
        const value = match ? parseFloat(match[0]) : 0;
        return status.includes('ต่ำกว่า') ? -value : value;
      };

      const valueA = getStatusValue(a.status);
      const valueB = getStatusValue(b.status);

      return order === 'ASC' ? valueA - valueB : valueB - valueA;
    });
  }

  private formatLogEntry(log: LogEntity) {
    return {
      date: log.DATE,
      value: log.VALUE,
      uid: log.UID,
    };
  }

  private formatLogWithStatus(log: LogEntity) {
    const standard = LOG_STANDARDS[log.LOG_NAME];
    const value = log.VALUE;
    let status: string;
    let deviation: number | null = null;

    if (value < standard.min) {
      deviation = ((standard.min - value) / standard.min) * 100;
      status = `ต่ำกว่าเกณฑ์ ${deviation.toFixed(1)}%`;
    } else if (value > standard.max) {
      deviation = ((value - standard.max) / standard.max) * 100;
      status = `เกินเกณฑ์ ${deviation.toFixed(1)}%`;
    } else {
      status = 'ผ่านเกณฑ์';
    }

    return {
      date: log.DATE,
      log_name: log.LOG_NAME,
      detail: `${value} ${standard.unit}`,
      status,
    };
  }
}
