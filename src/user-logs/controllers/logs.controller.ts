import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe, Query, ParseIntPipe } from '@nestjs/common';
import { LogsService } from '../services/logs.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogEntity, LogType } from '../../typeorm/entities/log.entity';

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

  // @Get('user/:userId')
  // async getLogsByUserAndType(
  //   @Param('userId') userId: string,
  //   @Query('type', new ParseEnumPipe(LogType)) type: LogType
  // ) {
  //   return this.logsService.getLogsByUserAndType(+userId, type);
  // }

  // @Get('user/:userId')
  // async getLogsByUser(
  //   @Param('userId', ParseIntPipe) userId: number,
  //   @Query('type') type?: LogType
  // ): Promise<LogEntity[]> {
  //   return this.logsService.getLogsByUserAndType(userId, type);
  // }

  @Get('user/:userId')
  async getLogsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('type') type?: LogType,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<LogEntity[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.logsService.getLogsByUserAndType(userId, type, start, end);
  }

  @Get('user/:userId/today')
  async getTodayLogsByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('type') type?: LogType
  ): Promise<LogEntity[]> {
    return this.logsService.getTodayLogsByUser(userId, type);
  }
  
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLogDto: UpdateLogDto) {
    return this.logsService.update(+id, updateLogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.logsService.remove(+id);
  }
}