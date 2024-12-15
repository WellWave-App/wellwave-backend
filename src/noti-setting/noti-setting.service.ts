import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateNotiSettingDto } from './dto/create-noti-setting.dto';
import { UpdateNotiSettingDto } from './dto/update-noti-setting.dto';
import { CreateBedTime as BedTimeDto } from './dto/bedtime.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BedtimeSettingsEntity,
  NotificationSettingsEntity,
  NotificationType,
} from '@/.typeorm/entities/noti-setting.entity';
import { Repository } from 'typeorm';
import { error } from 'console';

@Injectable()
export class NotiSettingService {
  constructor(
    @InjectRepository(NotificationSettingsEntity)
    private notificationSetting: Repository<NotificationSettingsEntity>,
    @InjectRepository(BedtimeSettingsEntity)
    private bedtimeSettings: Repository<BedtimeSettingsEntity>,
  ) {}
  create(createNotiSettingDto: CreateNotiSettingDto) {
    return 'This action adds a new notiSetting';
  }

  async getNotiSettingBedtime(
    uid: number,
  ): Promise<NotificationSettingsEntity> {
    const notiBedtimeSetting = await this.notificationSetting.findOne({
      where: {
        UID: uid,
        NOTIFICATION_TYPE: NotificationType.BEDTIME,
      },
    });

    if (!notiBedtimeSetting) {
      throw new NotFoundException('Not found notification bed setting');
    }

    return notiBedtimeSetting;
  }

  async createNotificationSetting(
    uid: number,
    notificationType: NotificationType,
    isActive: boolean,
  ): Promise<NotificationSettingsEntity> {
    const exist = await this.notificationSetting.findOne({
      where: {
        UID: uid,
        NOTIFICATION_TYPE: notificationType,
      },
    });

    if (Boolean(exist)) {
      throw new ConflictException(
        `This ${notificationType} setting of user with UID:${uid} already exist `,
      );
    }

    const notificationSetting = this.notificationSetting.create({
      UID: uid,
      NOTIFICATION_TYPE: notificationType,
      IS_ACTIVE: isActive,
      CREATE_AT: new Date(),
    });

    return await this.notificationSetting.save(notificationSetting);
  }

  async getBedTimeSetting(uid: number): Promise<BedtimeSettingsEntity> {
    const bedTimeSetting = await this.bedtimeSettings.findOne({
      where: { UID: uid, NOTIFICATION_TYPE: NotificationType.BEDTIME },
    });

    if (!bedTimeSetting) {
      throw new NotFoundException('Not Found Bedtime settings');
    }

    return bedTimeSetting;
  }

  async createBedtimeSetting(
    createBedtimeDto: BedTimeDto,
  ): Promise<BedtimeSettingsEntity> {
    const exist = await this.bedtimeSettings.findOne({
      where: {
        UID: createBedtimeDto.UID,
        NOTIFICATION_TYPE: NotificationType.BEDTIME,
      },
    });

    if (Boolean(exist)) {
      throw new ConflictException(
        `This ${NotificationType.BEDTIME} setting of user with UID:${createBedtimeDto.UID} already exist `,
      );
    }

    const bedtimeDate = this.convertTimeStringToDate(createBedtimeDto.BEDTIME);
    const wakeTimeDate = this.convertTimeStringToDate(
      createBedtimeDto.WAKE_TIME,
    );

    const bedTimeSetting = this.bedtimeSettings.create({
      UID: createBedtimeDto.UID,
      NOTIFICATION_TYPE: NotificationType.BEDTIME,
      BEDTIME: bedtimeDate,
      WAKE_TIME: wakeTimeDate,
    });

    return await this.bedtimeSettings.save(bedTimeSetting);
  }

  async updateBedtimeSetting(
    updateBedtimeDto: BedTimeDto,
  ): Promise<BedtimeSettingsEntity> {
    const currentBedtimeSetting = await this.getBedTimeSetting(
      updateBedtimeDto.UID,
    );

    let bedtimeDate: Date;
    if (updateBedtimeDto.BEDTIME) {
      bedtimeDate = this.convertTimeStringToDate(updateBedtimeDto.BEDTIME);
      // const [hours, minutes] = updateBedtimeDto.BEDTIME.split(':');
      // bedtimeDate.setHours(Number(hours), Number(minutes), 0, 0);
    }

    let wakeTimeDate: Date;
    if (updateBedtimeDto.WAKE_TIME) {
      wakeTimeDate = this.convertTimeStringToDate(updateBedtimeDto.WAKE_TIME);
      // const [hours, minutes] = updateBedtimeDto.WAKE_TIME.split(':');
      // wakeTimeDate.setHours(Number(hours), Number(minutes), 0, 0);
    }

    const updatedBedtime: BedtimeSettingsEntity = {
      UID: updateBedtimeDto.UID,
      BEDTIME: bedtimeDate || currentBedtimeSetting.BEDTIME,
      WAKE_TIME: wakeTimeDate || currentBedtimeSetting.WAKE_TIME,
      NOTIFICATION_TYPE: NotificationType.BEDTIME,
      notificationSetting: currentBedtimeSetting.notificationSetting,
    };
    Object.assign(currentBedtimeSetting, updatedBedtime);
    return this.bedtimeSettings.save(currentBedtimeSetting);
  }

  async setBedTime(bedTimeDto: BedTimeDto): Promise<{
    settingType: NotificationType;
    isActive: boolean;
    setting: BedtimeSettingsEntity;
  }> {
    try {
      // check main setting is bed time on / off
      let NotiSettingBedtime: NotificationSettingsEntity | null = null;

      if (bedTimeDto.IS_ACTIVE != null) {
        NotiSettingBedtime = await this.getNotiSettingBedtime(
          bedTimeDto.UID,
        ).catch((error) => {
          if (error instanceof NotFoundException) {
            throw error;
          }
          return null;
        });

        if (!NotiSettingBedtime) {
          NotiSettingBedtime = await this.createNotificationSetting(
            bedTimeDto.UID,
            NotificationType.BEDTIME,
            bedTimeDto.IS_ACTIVE,
          );
        }
      }

      // next get bedtime_settings for update
      // before that check if its exist?

      const existingBedtimeSetting = await this.getBedTimeSetting(
        bedTimeDto.UID,
      ).catch((error) => {
        if (error instanceof NotFoundException) {
          throw error;
        }

        return null;
      });

      const updatedBedtimeSetting = existingBedtimeSetting
        ? await this.updateBedtimeSetting(bedTimeDto)
        : await this.createBedtimeSetting(bedTimeDto);

      return {
        settingType: NotificationType.BEDTIME,
        isActive: NotiSettingBedtime?.IS_ACTIVE ?? false,
        setting: updatedBedtimeSetting,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update bedtime settings',
        error.message,
      );
    }
  }

  private convertTimeStringToDate(timeString: string): Date {
    if (!timeString) return null;
    const date = new Date();
    const [hours, minutes] = timeString.split(':');
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date;
  }
}
