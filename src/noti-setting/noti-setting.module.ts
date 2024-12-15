import { Module } from '@nestjs/common';
import { NotiSettingService } from './noti-setting.service';
import { NotiSettingController } from './noti-setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BedtimeSettingsEntity,
  NotificationSettingsEntity,
  WaterIndividualTimesEntity,
  WaterRangeSettingsEntity,
} from '../.typeorm/entities/noti-setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationSettingsEntity,
      WaterRangeSettingsEntity,
      BedtimeSettingsEntity,
      WaterIndividualTimesEntity,
    ]),
  ],
  controllers: [NotiSettingController],
  providers: [NotiSettingService],
})
export class NotiSettingModule {}
