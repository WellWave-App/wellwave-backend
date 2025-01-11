import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  NotificationSettingsEntity,
  NotificationType,
} from '@/.typeorm/entities/noti-setting.entity';
import { Repository } from 'typeorm';
import { error } from 'console';
import { WaterRangeSettingsEntity } from '@/.typeorm/entities/noti-water-range.entity';
import { BedtimeSettingsEntity } from '@/.typeorm/entities/noti-bedtime-setting.entity';
import { WaterPlanSettingEntity } from '@/.typeorm/entities/noti-water-plan.entity';
import { BedtimeDTO, WaterPlanDTO, WaterRangeDTO } from '../dto/setting.dto';

@Injectable()
export class NotiSettingService {
  constructor(
    @InjectRepository(NotificationSettingsEntity)
    private notificationRepo: Repository<NotificationSettingsEntity>,
    @InjectRepository(BedtimeSettingsEntity)
    private bedtimeRepo: Repository<BedtimeSettingsEntity>,
    @InjectRepository(WaterRangeSettingsEntity)
    private waterRangeRepo: Repository<WaterRangeSettingsEntity>,
    @InjectRepository(WaterPlanSettingEntity)
    private waterPlanRepo: Repository<WaterPlanSettingEntity>,
  ) {}

  async getNotiSetting(
    uid: number,
    notificationType: NotificationType,
  ): Promise<NotificationSettingsEntity> {
    let relationSetting: string;
    switch (notificationType) {
      case NotificationType.BEDTIME:
        relationSetting = 'bedtimeSettings';
        break;
      case NotificationType.WATER_PLAN:
        relationSetting = 'waterPlanSetting';
        break;
      default:
        relationSetting = 'waterRangeSettings';
    }

    const notificationSetting = await this.notificationRepo.findOne({
      where: {
        UID: uid,
        NOTIFICATION_TYPE: notificationType,
      },
      relations: [relationSetting, 'user'],
    });

    if (!notificationSetting) {
      throw new NotFoundException(
        `Not found notification ${notificationType} setting`,
      );
    }

    return notificationSetting;
  }

  async createNotificationSetting(
    uid: number,
    notificationType: NotificationType,
    isActive: boolean = false,
  ): Promise<NotificationSettingsEntity> {
    const exist = await this.notificationRepo.findOne({
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

    const notificationSetting = this.notificationRepo.create({
      UID: uid,
      NOTIFICATION_TYPE: notificationType,
      IS_ACTIVE: isActive,
      CREATE_AT: new Date(),
    });

    return await this.notificationRepo.save(notificationSetting);
  }

  async getBedTimeSetting(uid: number): Promise<BedtimeSettingsEntity> {
    const bedTimeSetting = await this.bedtimeRepo.findOne({
      where: { UID: uid, NOTIFICATION_TYPE: NotificationType.BEDTIME },
    });

    if (!bedTimeSetting) {
      throw new NotFoundException('Not Found Bedtime settings');
    }

    return bedTimeSetting;
  }

  async createBedtimeSetting(
    createBedtimeDto: BedtimeDTO,
  ): Promise<BedtimeSettingsEntity> {
    // First, ensure notification setting exists
    let notificationSetting = await this.notificationRepo.findOne({
      where: {
        UID: createBedtimeDto.UID,
        NOTIFICATION_TYPE: NotificationType.BEDTIME,
      },
    });

    // If not exists, create notification setting first
    if (!notificationSetting) {
      notificationSetting = await this.createNotificationSetting(
        createBedtimeDto.UID,
        NotificationType.BEDTIME,
        createBedtimeDto.IS_ACTIVE,
      );
      // await this.notificationSetting.save({
      //   UID: createBedtimeDto.UID,
      //   NOTIFICATION_TYPE: NotificationType.BEDTIME,
      //   IS_ACTIVE: true,
      //   CREATE_AT: new Date()
      // });
    }

    const exist = await this.bedtimeRepo.findOne({
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

    const bedTimeSetting = this.bedtimeRepo.create({
      UID: createBedtimeDto.UID,
      NOTIFICATION_TYPE: NotificationType.BEDTIME,
      BEDTIME: bedtimeDate,
      WAKE_TIME: wakeTimeDate,
      // notificationSetting:
    });

    return await this.bedtimeRepo.save(bedTimeSetting);
  }

  async updateBedtimeSetting(
    updateBedtimeDto: BedtimeDTO,
  ): Promise<BedtimeSettingsEntity> {
    const currentBedtimeSetting = await this.getBedTimeSetting(
      updateBedtimeDto.UID,
    );

    const bedtimeDate = this.convertTimeStringToDate(updateBedtimeDto.BEDTIME);
    const wakeTimeDate = this.convertTimeStringToDate(
      updateBedtimeDto.WAKE_TIME,
    );

    Object.assign(currentBedtimeSetting, {
      BEDTIME: bedtimeDate || currentBedtimeSetting.BEDTIME,
      WAKE_TIME: wakeTimeDate || currentBedtimeSetting.WAKE_TIME,
    });

    return await this.bedtimeRepo.save(currentBedtimeSetting);
  }

  async setBedTime(bedTimeDto: BedtimeDTO): Promise<{
    settingType: NotificationType;
    isActive: boolean;
    setting: {
      UID: number;
      NOTIFICATION_TYPE: NotificationType;
      BEDTIME: string;
      WAKE_TIME: string;
    };
  }> {
    try {
      // Check main setting is bed time on / off
      let notiSettingBedtime: NotificationSettingsEntity | null = null;

      if (bedTimeDto.IS_ACTIVE != null) {
        try {
          notiSettingBedtime = await this.getNotiSetting(
            bedTimeDto.UID,
            NotificationType.BEDTIME,
          );
          if (notiSettingBedtime) {
            notiSettingBedtime.IS_ACTIVE = bedTimeDto.IS_ACTIVE;
            notiSettingBedtime =
              await this.notificationRepo.save(notiSettingBedtime);
          }
        } catch (error) {
          if (error instanceof NotFoundException) {
            // Create new notification setting if it doesn't exist
            notiSettingBedtime = await this.createNotificationSetting(
              bedTimeDto.UID,
              NotificationType.BEDTIME,
              bedTimeDto.IS_ACTIVE,
            );
          } else {
            throw error;
          }
        }
      }

      // Try to get existing bedtime setting
      let existingBedtimeSetting: BedtimeSettingsEntity | null = null;
      try {
        existingBedtimeSetting = await this.getBedTimeSetting(bedTimeDto.UID);
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
      }

      // Update existing or create new bedtime setting
      const updatedBedtimeSetting = existingBedtimeSetting
        ? await this.updateBedtimeSetting(bedTimeDto)
        : await this.createBedtimeSetting(bedTimeDto);

      return {
        settingType: NotificationType.BEDTIME,
        isActive: notiSettingBedtime?.IS_ACTIVE ?? false,
        setting: {
          ...updatedBedtimeSetting,
          BEDTIME:
            updatedBedtimeSetting.BEDTIME instanceof Date
              ? this.convertDateToTimeString(updatedBedtimeSetting.BEDTIME)
              : updatedBedtimeSetting.BEDTIME,
          WAKE_TIME:
            updatedBedtimeSetting.WAKE_TIME instanceof Date
              ? this.convertDateToTimeString(updatedBedtimeSetting.WAKE_TIME)
              : updatedBedtimeSetting.WAKE_TIME,
        },
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

  async getWaterRangeSetting(uid: number): Promise<WaterRangeSettingsEntity> {
    const waterRangeSetting = await this.waterRangeRepo.findOne({
      where: { UID: uid, NOTIFICATION_TYPE: NotificationType.WATER_RANGE },
    });

    if (!waterRangeSetting) {
      throw new NotFoundException(
        `Not Found ${NotificationType.WATER_RANGE} settings`,
      );
    }

    return waterRangeSetting;
  }

  async updateWaterRangeSetting(
    updateWaterRangeDto: WaterRangeDTO,
  ): Promise<WaterRangeSettingsEntity> {
    const existWaterRangeSetting = await this.getWaterRangeSetting(
      updateWaterRangeDto.UID,
    );

    const startTime: Date = updateWaterRangeDto.START_TIME
      ? this.convertTimeStringToDate(updateWaterRangeDto.START_TIME)
      : null;

    const endTime: Date = updateWaterRangeDto.END_TIME
      ? this.convertTimeStringToDate(updateWaterRangeDto.END_TIME)
      : null;

    Object.assign(existWaterRangeSetting, {
      START_TIME: startTime || existWaterRangeSetting.START_TIME,
      END_TIME: endTime || existWaterRangeSetting.END_TIME,
      GLASSES_PER_DAY:
        updateWaterRangeDto.GLASSES_PER_DAY ||
        existWaterRangeSetting.GLASSES_PER_DAY,
      INTERVAL_MINUTES:
        updateWaterRangeDto.INTERVAL_MINUTES ||
        existWaterRangeSetting.INTERVAL_MINUTES,
    });

    return await this.waterRangeRepo.save(existWaterRangeSetting);
  }

  async createWaterRangeSetting(
    createWaterRangeSetting: WaterRangeDTO,
  ): Promise<WaterRangeSettingsEntity> {
    // First, ensure notification setting exists
    let notificationSetting = await this.notificationRepo.findOne({
      where: {
        UID: createWaterRangeSetting.UID,
        NOTIFICATION_TYPE: NotificationType.WATER_RANGE,
      },
    });

    // If not exists, create notification setting first
    if (!notificationSetting) {
      notificationSetting = await this.createNotificationSetting(
        createWaterRangeSetting.UID,
        NotificationType.WATER_RANGE,
        createWaterRangeSetting.IS_ACTIVE,
      );
    }

    const exist = await this.waterRangeRepo.findOne({
      where: {
        UID: createWaterRangeSetting.UID,
        NOTIFICATION_TYPE: NotificationType.WATER_RANGE,
      },
    });

    if (Boolean(exist)) {
      throw new ConflictException(
        `This ${NotificationType.WATER_RANGE} setting of user with UID:${createWaterRangeSetting.UID} already exist `,
      );
    }

    const startDate = this.convertTimeStringToDate(
      createWaterRangeSetting.START_TIME,
    );
    const endDate = this.convertTimeStringToDate(
      createWaterRangeSetting.END_TIME,
    );

    const wanterRangeSetting = this.waterRangeRepo.create({
      UID: createWaterRangeSetting.UID,
      NOTIFICATION_TYPE: NotificationType.WATER_RANGE,
      START_TIME: startDate,
      END_TIME: endDate,
      GLASSES_PER_DAY: createWaterRangeSetting.GLASSES_PER_DAY || 8,
      INTERVAL_MINUTES: createWaterRangeSetting.INTERVAL_MINUTES,
    });

    return await this.waterRangeRepo.save(wanterRangeSetting);
  }

  async setWaterRangeTime(updateWaterRangeDto: WaterRangeDTO): Promise<{
    settingType: NotificationType;
    isActive: boolean;
    setting: {
      UID: number;
      NOTIFICATION_TYPE: NotificationType;
      START_TIME: string;
      END_TIME: string;
      GLASSES_PER_DAY: number;
      INTERVAL_MINUTES: number;
    };
  }> {
    try {
      // Check main setting is water range on/off
      let notiSettingWaterRange: NotificationSettingsEntity | null = null;

      if (updateWaterRangeDto.IS_ACTIVE != null) {
        try {
          notiSettingWaterRange = await this.getNotiSetting(
            updateWaterRangeDto.UID,
            NotificationType.WATER_RANGE,
          );
          if (notiSettingWaterRange) {
            notiSettingWaterRange.IS_ACTIVE = updateWaterRangeDto.IS_ACTIVE;
            notiSettingWaterRange = await this.notificationRepo.save(
              notiSettingWaterRange,
            );
          }
        } catch (error) {
          if (error instanceof NotFoundException) {
            notiSettingWaterRange = await this.createNotificationSetting(
              updateWaterRangeDto.UID,
              NotificationType.WATER_RANGE,
              updateWaterRangeDto.IS_ACTIVE,
            );
          } else {
            throw error;
          }
        }
      }

      // Try to get existing water range setting
      let existsWaterRangeSetting: WaterRangeSettingsEntity | null = null;
      try {
        existsWaterRangeSetting = await this.getWaterRangeSetting(
          updateWaterRangeDto.UID,
        );
      } catch (error) {
        if (!(error instanceof NotFoundException)) {
          throw error;
        }
        // If NotFoundException, continue to create new setting
      }

      const updatedWaterRangeSetting = existsWaterRangeSetting
        ? await this.updateWaterRangeSetting(updateWaterRangeDto)
        : await this.createWaterRangeSetting(updateWaterRangeDto);

      return {
        settingType: NotificationType.WATER_RANGE,
        isActive: notiSettingWaterRange?.IS_ACTIVE ?? false,
        setting: {
          ...updatedWaterRangeSetting,
          START_TIME:
            updatedWaterRangeSetting.START_TIME instanceof Date
              ? this.convertDateToTimeString(
                  updatedWaterRangeSetting.START_TIME,
                )
              : updatedWaterRangeSetting.START_TIME,
          END_TIME:
            updatedWaterRangeSetting.END_TIME instanceof Date
              ? this.convertDateToTimeString(updatedWaterRangeSetting.END_TIME)
              : updatedWaterRangeSetting.END_TIME,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update water range settings',
        error.message,
      );
    }
  }

  async getWaterPlanSetting(
    uid: number,
    glassNumber: number,
  ): Promise<WaterPlanSettingEntity> {
    const waterPlan = await this.waterPlanRepo.findOne({
      where: { UID: uid, GLASS_NUMBER: glassNumber },
    });

    if (!waterPlan) {
      throw new NotFoundException(
        `Water plan for UID:${uid} and Glass Number:${glassNumber} not found`,
      );
    }

    return waterPlan;
  }

  async updateWaterPlanSetting(waterPlanDTO: WaterPlanDTO) {
    const existWaterPlanSetting = await this.getWaterPlanSetting(
      waterPlanDTO.UID,
      waterPlanDTO.GLASS_NUMBER,
    );

    const notiTime: Date = waterPlanDTO.NOTI_TIME
      ? this.convertTimeStringToDate(waterPlanDTO.NOTI_TIME)
      : null;

    Object.assign(existWaterPlanSetting, {
      NOTI_TIME: notiTime || existWaterPlanSetting.NOTI_TIME,
    });

    return await this.waterPlanRepo.save(existWaterPlanSetting);
  }

  async createWaterPlanSetting(waterPlanDTO: WaterPlanDTO) {
    // First, ensure notification setting exists
    let notificationSetting = await this.notificationRepo.findOne({
      where: {
        UID: waterPlanDTO.UID,
        NOTIFICATION_TYPE: NotificationType.WATER_PLAN,
      },
    });

    // If not exists, create notification setting first
    if (!notificationSetting) {
      notificationSetting = await this.createNotificationSetting(
        waterPlanDTO.UID,
        NotificationType.WATER_PLAN,
        waterPlanDTO.IS_ACTIVE,
      );
    }

    const exist = await this.waterPlanRepo.findOne({
      where: {
        GLASS_NUMBER: waterPlanDTO.GLASS_NUMBER,
        UID: waterPlanDTO.UID,
      },
    });

    if (Boolean(exist)) {
      throw new ConflictException(
        `This ${NotificationType.WATER_PLAN} setting of GLASS_NUMBER:${waterPlanDTO.GLASS_NUMBER} already exist `,
      );
    }

    const notiDate = this.convertTimeStringToDate(waterPlanDTO.NOTI_TIME);

    const wanterPlanSetting = this.waterPlanRepo.create({
      ...waterPlanDTO,
      NOTIFICATION_TYPE: NotificationType.WATER_PLAN,
      NOTI_TIME: notiDate,
    });

    return await this.waterPlanRepo.save(wanterPlanSetting);
  }

  async setWaterPlan(waterPlanDTO: WaterPlanDTO) {
    try {
      let notiSettingWaterPlan: NotificationSettingsEntity | null = null;

      try {
        notiSettingWaterPlan = await this.getNotiSetting(
          waterPlanDTO.UID,
          NotificationType.WATER_PLAN,
        );

        if (notiSettingWaterPlan) {
          notiSettingWaterPlan.IS_ACTIVE =
            waterPlanDTO.IS_ACTIVE ?? notiSettingWaterPlan.IS_ACTIVE;
          notiSettingWaterPlan =
            await this.notificationRepo.save(notiSettingWaterPlan);
        }
      } catch (error) {
        if (error instanceof NotFoundException) {
          notiSettingWaterPlan = await this.createNotificationSetting(
            waterPlanDTO.UID,
            NotificationType.WATER_PLAN,
            waterPlanDTO.IS_ACTIVE ?? false,
          );
        } else {
          throw error;
        }
      }

      let existsWaterPlanSetting: WaterPlanSettingEntity | null = null;
      if (waterPlanDTO.GLASS_NUMBER != null) {
        // Try to get existing water plan setting
        try {
          existsWaterPlanSetting = await this.getWaterPlanSetting(
            waterPlanDTO.UID,
            waterPlanDTO.GLASS_NUMBER,
          );
        } catch (error) {
          if (!(error instanceof NotFoundException)) {
            throw error;
          }
          // If NotFoundException, continue to create new setting
        }
      }

      const updatedWaterplanSetting = existsWaterPlanSetting
        ? await this.updateWaterPlanSetting(waterPlanDTO)
        : await this.createWaterPlanSetting(waterPlanDTO);

      // const waterPlans = await this.waterPlanRepo.find({
      //   where: { UID: waterPlanDTO.UID },
      // });
      return {
        settingType: NotificationType.WATER_PLAN,
        isActive: notiSettingWaterPlan?.IS_ACTIVE ?? false,
        setting: {
          ...updatedWaterplanSetting,
          NOTI_TIME:
            updatedWaterplanSetting.NOTI_TIME instanceof Date
              ? this.convertDateToTimeString(updatedWaterplanSetting.NOTI_TIME)
              : updatedWaterplanSetting.NOTI_TIME,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update water plan settings',
        error.message,
      );
    }
  }

  private convertTimeStringToDate(timeString: string): Date {
    if (!timeString) return null;
    const date = new Date(0);
    const [hours, minutes] = timeString.split(':');
    date.setHours(Number(hours), Number(minutes), 0, 0);
    return date;
  }

  private convertDateToTimeString(dateTime: Date): string {
    if (!dateTime) return null;

    // Pad single digits with leading zero
    const hours = dateTime.getHours().toString().padStart(2, '0');
    const minutes = dateTime.getMinutes().toString().padStart(2, '0');
    const seconds = dateTime.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }
}
