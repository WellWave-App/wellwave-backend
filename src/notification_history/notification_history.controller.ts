import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
  Put,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { NotificationHistoryService } from './notification_history.service';
import { UpdateNotificationDto } from './dto/update-notification_history.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification_history.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { NotificationHistory } from '@/.typeorm/entities/notification_history.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { NotificationQueryDto } from './dto/notficaiton-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('notification-history')
export class NotificationHistoryController {
  constructor(
    private readonly notificationService: NotificationHistoryService,
  ) {}

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Patch('/mark-all-read')
  @ApiOperation({ summary: 'Mark all notifications as read for a user' })
  @ApiResponse({ status: 204 })
  markAllAsRead(@Request() req): Promise<{ message: string; count: number }> {
    return this.notificationService.markAllAsRead(req.user.UID);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Patch('/read/:id')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, type: NotificationHistory })
  markAsRead(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationHistory> {
    return this.notificationService.markAsRead(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, type: NotificationHistory })
  create(
    @Body() createDto: CreateNotificationDto,
    @Request() req,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<NotificationHistory> {
    if (!createDto.UID) {
      createDto.UID = req.user.UID;
    }
    return this.notificationService.create(createDto, file);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get()
  @ApiOperation({
    summary: 'Get all notifications with pagination and filters',
  })
  @ApiResponse({ status: 200, type: NotificationHistory, isArray: true })
  findAll(
    @Query() query: NotificationQueryDto,
  ): Promise<PaginatedResponse<NotificationHistory>> {
    return this.notificationService.findAll(query);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get('/:id')
  @ApiOperation({ summary: 'Get a notification by ID' })
  @ApiResponse({ status: 200, type: NotificationHistory })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationHistory> {
    return this.notificationService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Patch('/:id')
  @ApiOperation({ summary: 'Update a notification' })
  @ApiResponse({ status: 200, type: NotificationHistory })
  @UseInterceptors(FileInterceptor('file'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateNotificationDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<NotificationHistory> {
    return this.notificationService.update(id, updateDto, file);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Delete('/:id')
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 204 })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.notificationService.remove(id);
  }
}
