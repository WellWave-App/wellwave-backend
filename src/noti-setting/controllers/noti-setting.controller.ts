import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { NotiSettingService } from '../services/noti-setting.service';
import { NotificationType } from '@/.typeorm/entities/noti-setting.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { BedtimeDTO, WaterPlanDTO, WaterRangeDTO } from '../dto/setting.dto';
import { User } from '@/.typeorm/entities/users.entity';

@ApiTags('Notification Settings')
@ApiBearerAuth()
@Controller('noti-setting')
export class NotiSettingController {
  constructor(private readonly notiSettingService: NotiSettingService) {}

  @ApiOperation({
    summary: 'Get notification settings by type',
    description:
      'Retrieves notification settings for the authenticated user based on notification type',
  })
  @ApiParam({
    name: 'notificationType',
    enum: NotificationType,
    description: 'Type of notification setting to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification settings retrieved successfully',
    schema: {
      example: {
        UID: 1,
        NOTIFICATION_TYPE: 'BEDTIME',
        IS_ACTIVE: true,
        CREATE_AT: '2024-01-01T00:00:00.000Z',
        bedtimeSettings: {
          BEDTIME: '22:00:00',
          WAKE_TIME: '06:00:00',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiNotFoundResponse({ description: 'Notification settings not found' })
  @Get('get-noti/:notificationType')
  @UseGuards(JwtAuthGuard)
  getNotificationSetting(
    @Param('notificationType') notificationType: NotificationType,
    @Request() req,
  ) {
    return this.notiSettingService.getNotiSetting(
      req.user.UID,
      notificationType,
    );
  }

  @ApiOperation({
    summary: 'Set bedtime notification settings',
    description:
      'Create or update bedtime notification settings for the authenticated user',
  })
  @ApiBody({
    type: BedtimeDTO,
    description: 'Bedtime settings data',
    examples: {
      example1: {
        value: {
          settingType: 'BEDTIME',
          isActive: true,
          setting: {
            UID: 28,
            NOTIFICATION_TYPE: 'BEDTIME',
            BEDTIME: '20:30:00',
            WAKE_TIME: '04:30:00',
            WEEKDAYS: {
              Friday: true,
              Monday: true,
              Sunday: false,
              Tuesday: true,
              Saturday: false,
              Thursday: false,
              Wednesday: false,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Bedtime settings updated successfully',
    schema: {
      example: {
        UID: 28,
        NOTIFICATION_TYPE: 'BEDTIME',
        IS_ACTIVE: true,
        CREATE_AT: '2025-01-15T11:09:18.767Z',
        bedtimeSettings: {
          UID: 28,
          NOTIFICATION_TYPE: 'BEDTIME',
          BEDTIME: '20:30:00',
          WAKE_TIME: '04:30:00',
          WEEKDAYS: {
            Friday: true,
            Monday: true,
            Sunday: false,
            Tuesday: true,
            Saturday: false,
            Thursday: false,
            Wednesday: false,
          },
        },
        user: User,
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiConflictResponse({ description: 'Bedtime settings already exist' })
  @Post('set-bed-time')
  @UseGuards(JwtAuthGuard)
  setBedTime(@Body() bedtimeDTO: BedtimeDTO) {
    return this.notiSettingService.setBedTime(bedtimeDTO);
  }

  @ApiOperation({
    summary: 'Set water range notification settings',
    description:
      'Create or update water range notification settings for the authenticated user',
  })
  @ApiBody({
    type: WaterRangeDTO,
    description: 'Water range settings data',
    examples: {
      example1: {
        value: {
          UID: 1,
          IS_ACTIVE: true,
          START_TIME: '08:00',
          END_TIME: '20:00',
          GLASSES_PER_DAY: 8,
          INTERVAL_MINUTES: 60,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Water range settings updated successfully',
    schema: {
      example: {
        settingType: 'WATER_RANGE',
        isActive: true,
        setting: {
          UID: 1,
          NOTIFICATION_TYPE: 'WATER_RANGE',
          START_TIME: '08:00:00',
          END_TIME: '20:00:00',
          GLASSES_PER_DAY: 8,
          INTERVAL_MINUTES: 60,
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiConflictResponse({ description: 'Water range settings already exist' })
  @Post('set-water-range')
  @UseGuards(JwtAuthGuard)
  setWaterRangeTime(@Body() waterRangeDTO: WaterRangeDTO) {
    return this.notiSettingService.setWaterRangeTime(waterRangeDTO);
  }

  @ApiOperation({
    summary: 'Set water plan notification settings',
    description:
      'Create or update water plan notification settings for the authenticated user',
  })
  @ApiBody({
    type: WaterPlanDTO,
    description: 'Water plan settings data',
    examples: {
      example1: {
        value: {
          UID: 1,
          GLASS_NUMBER: 1,
          NOTI_TIME: '09:00',
          IS_ACTIVE: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Water plan settings updated successfully',
    schema: {
      example: {
        settingType: 'WATER_PLAN',
        isActive: true,
        setting: [
          {
            GLASS_NUMBER: 1,
            UID: 1,
            NOTIFICATION_TYPE: 'WATER_PLAN',
            NOTI_TIME: '09:00:00',
          },
        ],
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'User is not authenticated' })
  @ApiConflictResponse({
    description: 'Water plan settings already exist for this glass number',
  })
  @Post('set-water-plan')
  @UseGuards(JwtAuthGuard)
  setWaterPlan(@Body() waterPlanDTO: WaterPlanDTO) {
    return this.notiSettingService.setWaterPlan(waterPlanDTO);
  }
}
