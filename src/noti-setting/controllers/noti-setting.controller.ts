import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Response,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { NotiSettingService } from '../services/noti-setting.service';
import { BedtimeDTO } from '../dto/bedtime.dto';
import { WaterRangeDTO } from '../dto/water-range.dto';
import { NotificationType } from '@/.typeorm/entities/noti-setting.entity';
import { WaterPlanDTO } from '../dto/water-plan.dto';

@Controller('noti-setting')
export class NotiSettingController {
  constructor(private readonly notiSettingService: NotiSettingService) {}

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

  @Post('set-bed-time')
  @UseGuards(JwtAuthGuard)
  setBedTime(@Body() bedtimeDTO: BedtimeDTO) {
    return this.notiSettingService.setBedTime(bedtimeDTO);
  }

  @Post('set-water-range')
  @UseGuards(JwtAuthGuard)
  setWaterRangeTime(@Body() waterRangeDTO: WaterRangeDTO) {
    return this.notiSettingService.setWaterRangeTime(waterRangeDTO);
  }

  @Post('set-water-plan')
  @UseGuards(JwtAuthGuard)
  setWaterPlan(@Body() waterPlanDTO: WaterPlanDTO) {
    return this.notiSettingService.setWaterPlan(waterPlanDTO);
  }
}
