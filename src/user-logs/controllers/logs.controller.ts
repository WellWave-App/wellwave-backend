import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { LogsService } from '../services/logs.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogEntity, LOG_NAME } from '../../.typeorm/entities/logs.entity';

@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  findAll() {
    return this.logsService.findAll();
  }

  @Get(':uid/:logName/:date')
  findOne(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
  ) {
    return this.logsService.findOne(uid, logName, new Date(date));
  }

  @Get('user/:uid')
  async getLogsByUser(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('logName') logName?: LOG_NAME,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.logsService.getLogsByUserAndType(uid, logName, start, end);
  }

  @Get('userWeekly/:uid')
  getWeeklyLogs(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('date') date?: string,
    @Query('logName') logName?: LOG_NAME,
  ) {
    return this.logsService.getWeeklyLogsByUser(uid, date, logName);
  }

  @Get('userToday/:uid')
  getTodayLogs(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('logName') logName?: LOG_NAME,
  ) {
    return this.logsService.getTodayLogsByUser(uid, logName);
  }

  @Patch(':uid/:logName/:date')
  update(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
    @Body() updateLogDto: UpdateLogDto,
  ) {
    return this.logsService.update(uid, logName, new Date(date), updateLogDto);
  }

  @Delete(':uid/:logName/:date')
  remove(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
  ) {
    return this.logsService.remove(uid, logName, new Date(date));
  }
}
