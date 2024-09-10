import { Controller, Get, Post, Body, Patch, Param, Delete, ParseEnumPipe } from '@nestjs/common';
import { LogsService } from '../services/logs.service';
import { CreateLogDto } from '../dto/create-log.dto';
import { UpdateLogDto } from '../dto/update-log.dto';
import { LogType } from '../../typeorm/entities/log.entity';

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

  @Get('user/:userId/type/:type')
  async getLogsByUserAndType(
    @Param('userId') userId: string,
    @Param('type', new ParseEnumPipe(LogType)) type: LogType
  ) {
    return this.logsService.getLogsByUserAndType(+userId, type);
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