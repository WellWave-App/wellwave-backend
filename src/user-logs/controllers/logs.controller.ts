import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe, Query, ParseIntPipe } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.logsService.findOne(+id);
  }

  @Get('user/:uid')
  async getLogsByUser(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('logName') logName?: LOG_NAME,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ){
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.logsService.getLogsByUserAndType(uid, logName, start, end);
  }

  @Get('user/:uid/today')
  async getTodayLogsByUser(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('logName') logName?: LOG_NAME
  ){
    return this.logsService.getTodayLogsByUser(uid, logName);
  }
  
  @Get('user/:uid/weekly')
  async getWeeklyLogsByUser(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('date') date: string,
    @Query('logName') logName?: LOG_NAME
  ){
    return this.logsService.getWeeklyLogsByUser(uid, date, logName);
  }

  // @Get('user/:uid')
  // async getLogsByUserWithDate(
  //   @Param('uid', ParseIntPipe) uid: number,
  //   @Query('logName') logName?: LOG_NAME,
  //   @Query('date') date?: Date,
  // ): Promise<LogEntity[]> {
  //   return this.logsService.getLogsByUserAndType(uid, logName, date, date);
  // }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}