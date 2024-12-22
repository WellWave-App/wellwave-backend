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
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery,
  ApiBody 
} from '@nestjs/swagger';

@ApiTags('Logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new log entry' })
  @ApiResponse({ 
    status: 201, 
    description: 'Log entry successfully created',
    type: LogEntity 
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Log entry already exists' })
  @ApiBody({ type: CreateLogDto })
  create(@Body() createLogDto: CreateLogDto) {
    return this.logsService.create(createLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all log entries' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns all log entries',
    schema: {
      type: 'object',
      properties: {
        LOGS: {
          type: 'array',
          items: { $ref: '#/components/schemas/LogEntity' }
        }
      }
    }
  })
  findAll() {
    return this.logsService.findAll();
  }

  @Get(':uid/:logName/:date')
  @ApiOperation({ summary: 'Find a specific log entry' })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiParam({ name: 'logName', description: 'Type of log', enum: LOG_NAME })
  @ApiParam({ name: 'date', description: 'Date of log entry', type: 'string' })
  @ApiResponse({ status: 200, type: LogEntity })
  @ApiResponse({ status: 404, description: 'Log entry not found' })
  findOne(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
  ) {
    return this.logsService.findOne(uid, logName, new Date(date));
  }

  @Get('user/:uid')
  @ApiOperation({ summary: 'Get logs by user with optional filters' })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiQuery({ name: 'logName', enum: LOG_NAME, required: false })
  @ApiQuery({ name: 'startDate', type: 'string', required: false })
  @ApiQuery({ name: 'endDate', type: 'string', required: false })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        LOGS: {
          type: 'array',
          items: { $ref: '#/components/schemas/LogEntity' }
        }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiOperation({ summary: 'Get weekly logs for a user' })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiQuery({ name: 'date', type: 'string', required: false })
  @ApiQuery({ name: 'logName', enum: LOG_NAME, required: false })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        LOGS: {
          type: 'array',
          items: { $ref: '#/components/schemas/LogEntity' }
        },
        WeekDateInformation: {
          type: 'object',
          properties: {
            dateSelected: { type: 'string' },
            startOfWeek: { type: 'string' },
            endOfWeek: { type: 'string' }
          }
        }
      }
    }
  })
  getWeeklyLogs(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('date') date?: string,
    @Query('logName') logName?: LOG_NAME,
  ) {
    return this.logsService.getWeeklyLogsByUser(uid, date, logName);
  }

  @Get('userToday/:uid')
  @ApiOperation({ summary: "Get user's logs for today" })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiQuery({ name: 'logName', enum: LOG_NAME, required: false })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        LOGS: {
          type: 'array',
          items: { $ref: '#/components/schemas/LogEntity' }
        }
      }
    }
  })
  getTodayLogs(
    @Param('uid', ParseIntPipe) uid: number,
    @Query('logName') logName?: LOG_NAME,
  ) {
    return this.logsService.getTodayLogsByUser(uid, logName);
  }

  @Patch(':uid/:logName/:date')
  @ApiOperation({ summary: 'Update a log entry' })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiParam({ name: 'logName', description: 'Type of log', enum: LOG_NAME })
  @ApiParam({ name: 'date', description: 'Date of log entry', type: 'string' })
  @ApiBody({ type: UpdateLogDto })
  @ApiResponse({ status: 200, type: LogEntity })
  @ApiResponse({ status: 404, description: 'Log entry not found' })
  update(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
    @Body() updateLogDto: UpdateLogDto,
  ) {
    return this.logsService.update(uid, logName, new Date(date), updateLogDto);
  }

  @Delete(':uid/:logName/:date')
  @ApiOperation({ summary: 'Delete a log entry' })
  @ApiParam({ name: 'uid', description: 'User ID', type: 'number' })
  @ApiParam({ name: 'logName', description: 'Type of log', enum: LOG_NAME })
  @ApiParam({ name: 'date', description: 'Date of log entry', type: 'string' })
  @ApiResponse({ 
    status: 200,
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        success: { type: 'boolean' }
      }
    }
  })
  @ApiResponse({ status: 404, description: 'Log entry not found' })
  remove(
    @Param('uid', ParseIntPipe) uid: number,
    @Param('logName') logName: LOG_NAME,
    @Param('date') date: string,
  ) {
    return this.logsService.remove(uid, logName, new Date(date));
  }
}