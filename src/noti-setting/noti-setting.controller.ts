import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { NotiSettingService } from './noti-setting.service';
import { CreateNotiSettingDto } from './dto/create-noti-setting.dto';
import { UpdateNotiSettingDto } from './dto/update-noti-setting.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { CreateBedTime } from './dto/bedtime.dto';

@Controller('noti-setting')
export class NotiSettingController {
  constructor(private readonly notiSettingService: NotiSettingService) {}

  @Post('set-bed-time')
  @UseGuards(JwtAuthGuard)
  setBedTime(@Body() createBedTime: CreateBedTime) {
    return this.notiSettingService.setBedTime(createBedTime);
  }
}
