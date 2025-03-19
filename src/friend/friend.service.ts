import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Friend } from '@/.typeorm/entities/friend.entity';
import { Repository } from 'typeorm';
import { PrivateSetting } from '@/.typeorm/entities/user-privacy.entity';
import {
  APP_ROUTE,
  NotificationHistory,
} from '@/.typeorm/entities/notification_history.entity';
import { NotificationHistoryService } from '@/notification_history/notification_history.service';
import { UsersService } from '@/users/services/users.service';
import { User } from '@/.typeorm/entities/users.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { LogsService } from '@/user-logs/services/logs.service';
import { LOG_NAME, LogEntity } from '@/.typeorm/entities/logs.entity';
import { DateService } from '@/helpers/date/date.services';
import { LeagueType } from '@/leagues/enum/lagues.enum';
import { UpdatePrivacySettingsDto } from './dto/update-pv.dto';

export interface friendInfo {
  UID: number;
  USERNAME: string;
  IMAGE_URL: string;
  LAST_LOGIN: Date;
  STEPS?: number;
  SLEEP_HOURS?: number;
  STEPS_LOG?: LogEntity[];
  SLEEP_LOG?: LogEntity[];
  EXP: number;
  GEM: number;
  LEAGUE: LeagueType;
}

@Injectable()
export class FriendService {
  constructor(
    @InjectRepository(Friend)
    private readonly friendRepo: Repository<Friend>,
    @InjectRepository(PrivateSetting)
    private readonly pvSettingRepo: Repository<PrivateSetting>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly notiHistoryService: NotificationHistoryService,
    private readonly userService: UsersService,
    private readonly logService: LogsService,
    private readonly dateService: DateService,
  ) {}

  async add(fromId: number, toId: number) {
    const requestData: CreateFriendDto = {
      USER1_ID: fromId,
      USER2_ID: toId,
      REQUESTED_BY_ID: fromId,
    };

    const data = this.friendRepo.create(requestData);
    await this.friendRepo.save(data);

    const user1 = await this.getUserData(fromId);
    const user2 = await this.getUserData(toId);

    // send notification to user
    await this.notiHistoryService.create({
      FROM: `${user1.USERNAME}`,
      TO: `${user2.USERNAME}`,
      MESSAGE: `${user1.USERNAME} has added you as a friend,say hi with your friend!`,
      IMAGE_URL: user1.IMAGE_URL,
      APP_ROUTE: APP_ROUTE.Friend,
      UID: toId,
    });
  }

  async search(uid: number) {
    return this.getUserData(uid) || null;
  }

  async unfriend(user1Id: number, user2Id: number) {
    const friend = await this.friendRepo.findOne({
      where: {
        USER1_ID: user1Id,
        USER2_ID: user2Id,
      },
    });

    await this.friendRepo.remove(friend);
    return {
      status: 'deleted successfully',
      data: friend,
    };
  }

  async getUserFriends(uid: number): Promise<PaginatedResponse<friendInfo>> {
    const friends = await this.friendRepo.find({
      where: [{ USER1_ID: uid }, { USER2_ID: uid }],
    });

    const formatData = await Promise.all(
      friends.map(async (friend) => {
        let friendData: User;
        if (friend.USER1_ID === uid) {
          friendData = await this.getUserData(friend.USER2_ID);
        } else {
          friendData = await this.getUserData(friend.USER1_ID);
        }

        const stepLog = await this.logService.getWeeklyLogsByUser(
          friendData.UID,
          null,
          LOG_NAME.STEP_LOG,
        );
        const sleepLog = await this.logService.getWeeklyLogsByUser(
          friendData.UID,
          null,
          LOG_NAME.SLEEP_LOG,
        );

        return {
          UID: friendData.UID,
          USERNAME: friendData.USERNAME,
          IMAGE_URL: friendData.IMAGE_URL,
          LAST_LOGIN: friendData.loginStreak.LAST_LOGIN_DATE,
          STEPS: friendData.privacy.SHOW_STEPS
            ? stepLog.LOGS.reduce((acc, log) => acc + log.VALUE, 0)
            : null,
          SLEEP_HOURS: friendData.privacy.SHOW_SLEEP_HOUR
            ? sleepLog.LOGS.reduce((acc, log) => acc + log.VALUE, 0)
            : null,
          EXP: friendData.privacy.SHOW_EXP ? friendData.EXP : null,
          GEM: friendData.privacy.SHOW_GEM ? friendData.GEM : null,
          LEAGUE: friendData.privacy.SHOW_LEAGUE
            ? friendData.league.CURRENT_LEAGUE
            : null,
        };
      }),
    );

    return {
      data: formatData,
      meta: { total: formatData.length },
    };
  }

  async getFriendProfle(
    uid: number,
    query?: {
      stepFromDate?: Date;
      stepToDate?: Date;
      sleepFromDate?: Date;
      sleepToDate?: Date;
    },
  ) {
    const friend = await this.getUserData(uid);

    const today = new Date(this.dateService.getCurrentDate().timestamp);
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    const stepLog = await this.logService.getLogsByUserAndType(
      friend.UID,
      LOG_NAME.STEP_LOG,
      query?.stepFromDate || sevenDaysAgo,
      query?.stepToDate || today,
    );

    const sleepLog = await this.logService.getLogsByUserAndType(
      friend.UID,
      LOG_NAME.SLEEP_LOG,
      query?.sleepFromDate || sevenDaysAgo,
      query?.sleepToDate || today,
    );

    const data: friendInfo = {
      UID: friend.UID,
      USERNAME: friend.USERNAME,
      IMAGE_URL: friend.IMAGE_URL,
      LAST_LOGIN: friend.loginStreak.LAST_LOGIN_DATE,
      EXP: friend.privacy.SHOW_EXP ? friend.EXP : null,
      GEM: friend.privacy.SHOW_GEM ? friend.GEM : null,
      LEAGUE: friend.privacy.SHOW_LEAGUE ? friend.league.CURRENT_LEAGUE : null,
      STEPS_LOG: friend.privacy.SHOW_STEPS ? stepLog.LOGS : null,
      SLEEP_LOG: friend.privacy.SHOW_SLEEP_HOUR ? sleepLog.LOGS : null,
    };

    return data;
  }

  async sendNoti(fromId: number, toId: number, message: string) {
    const user1 = await this.getUserData(fromId);
    const user2 = await this.getUserData(toId);
    await this.notiHistoryService.create({
      FROM: `${user1.USERNAME}`,
      TO: `${user2.USERNAME}`,
      MESSAGE: message,
      IMAGE_URL: user1.IMAGE_URL,
      APP_ROUTE: APP_ROUTE.Friend,
      UID: toId,
    });
  }

  async updatePrivacySettings(
    userId: number,
    updateDto: UpdatePrivacySettingsDto,
  ): Promise<PrivateSetting> {
    // Check if user exists
    const user = await this.userRepo.findOne({
      where: { UID: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get current settings
    let settings = await this.pvSettingRepo.findOne({
      where: { USER_ID: userId },
    });

    if (!settings) {
      // Create new settings if they don't exist
      settings = this.pvSettingRepo.create({
        USER_ID: userId,
        ...updateDto,
      });
    } else {
      // Update existing settings
      Object.assign(settings, updateDto);
    }

    // Save the settings
    await this.pvSettingRepo.save(settings);

    return settings;
  }

  async getPrivacySettings(userId: number): Promise<PrivateSetting> {
    const settings = await this.pvSettingRepo.findOne({
      where: { USER_ID: userId },
    });

    if (!settings) {
      throw new NotFoundException(
        `Privacy settings for user ${userId} not found`,
      );
    }

    return settings;
  }

  private async getUserData(uid: number) {
    return await this.userRepo.findOne({
      where: { UID: uid },
      relations: ['league', 'privacy'],
    });
  }
}
