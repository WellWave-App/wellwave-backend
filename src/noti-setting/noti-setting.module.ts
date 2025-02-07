import { Module } from '@nestjs/common';
import { NotiSettingService } from './services/noti-setting.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationSettingsEntity } from '../.typeorm/entities/noti-setting.entity';
import { NotiSettingController } from './controllers/noti-setting.controller';
import { WaterRangeSettingsEntity } from '../.typeorm/entities/noti-water-range.entity';
import { BedtimeSettingsEntity } from '../.typeorm/entities/noti-bedtime-setting.entity';
import { WaterPlanSettingEntity } from '../.typeorm/entities/noti-water-plan.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationSettingsEntity,
      WaterRangeSettingsEntity,
      BedtimeSettingsEntity,
      WaterPlanSettingEntity,
    ]),
  ],
  controllers: [NotiSettingController],
  providers: [NotiSettingService],
})
export class NotiSettingModule {}
