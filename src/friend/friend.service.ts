import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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

  private phrases = {
    english: [
      // Exercise phrases (indexes 0-4)
      'Time to move! A little exercise goes a long way.',
      'Your body will thank you for this workout!',
      'Exercise break! Even 10 minutes makes a difference.',
      'Movement is medicine - your daily dose awaits!',
      'Your metabolism needs this activity boost!',

      // Diet phrases (indexes 5-9)
      'Water break! Staying hydrated helps your metabolism.',
      'Choose colorful veggies for your next meal!',
      'Remember: protein helps rebuild and repair.',
      'Small, balanced meals keep your energy steady all day.',
      'Your food choices today shape your health tomorrow.',

      // Sleep phrases (indexes 10-14)
      'Wind down time! Good sleep = better metabolism.',
      'Your body repairs itself during sleep. Time to rest!',
      'Consistent sleep schedule is key to health. Bedtime soon!',
      'Put the screens away - your metabolism needs quality sleep.',
      'Sweet dreams lead to healthy days. Time for rest!',

      // General encouragement (indexes 15-24)
      "You've got this! Small steps lead to big changes.",
      'I believe in you - keep going on your health journey!',
      "Progress not perfection. You're doing great!",
      'Every healthy choice matters. Proud of you!',
      "Let's crush our health goals together today!",
      "How's your metabolism journey going today?",
      'Thinking of you! Did you get your movement in today?',
      'Water, veggies, movement - how are you tracking today?',
      'Just checking in - need any support with your health goals?',
      "You inspire me! How's your progress this week?",
    ],
    thai: [
      // Same structure as English but with Thai phrases
      // Exercise phrases (indexes 0-4)
      'ได้เวลาออกกำลังกายแล้ว! แค่นิดหน่อยก็ช่วยได้มาก',
      'ร่างกายของคุณจะขอบคุณสำหรับการออกกำลังกายครั้งนี้!',
      'พักเบรคมาออกกำลังกาย! แค่ 10 นาทีก็สร้างความแตกต่างได้',
      'การเคลื่อนไหวคือยา - รอคุณอยู่ทุกวัน!',
      'เมตาบอลิซึมของคุณต้องการการกระตุ้นจากกิจกรรมนี้!',

      // Diet phrases (indexes 5-9)
      'เวลาดื่มน้ำ! การรักษาความชุ่มชื้นช่วยเมตาบอลิซึมของคุณ',
      'เลือกผักที่มีสีสันสำหรับมื้อต่อไป!',
      'อย่าลืม: โปรตีนช่วยในการซ่อมแซมและฟื้นฟูร่างกาย',
      'มื้ออาหารเล็กๆ ที่สมดุลช่วยให้พลังงานคงที่ตลอดทั้งวัน',
      'ทางเลือกอาหารของคุณวันนี้ จะกำหนดสุขภาพของคุณในวันพรุ่งนี้',

      // Sleep phrases (indexes 10-14)
      'ได้เวลาผ่อนคลาย! การนอนที่ดี = เมตาบอลิซึมที่ดีขึ้น',
      'ร่างกายของคุณซ่อมแซมตัวเองระหว่างการนอน ได้เวลาพักผ่อน!',
      'ตารางการนอนที่สม่ำเสมอเป็นกุญแจสำคัญสู่สุขภาพ ใกล้ถึงเวลานอนแล้ว!',
      'เก็บหน้าจอไปซะ - เมตาบอลิซึมของคุณต้องการการนอนที่มีคุณภาพ',
      'ความฝันที่หวานนำไปสู่วันที่สดใส ถึงเวลาพักผ่อน!',

      // General encouragement (indexes 15-24)
      'คุณทำได้! ก้าวเล็กๆ นำไปสู่การเปลี่ยนแปลงครั้งใหญ่',
      'ฉันเชื่อในตัวคุณ - เดินหน้าต่อไปในเส้นทางสุขภาพของคุณ!',
      'ความคืบหน้าไม่ใช่ความสมบูรณ์แบบ คุณทำได้ดีมาก!',
      'ทุกทางเลือกที่ดีต่อสุขภาพมีความสำคัญ ภูมิใจในตัวคุณ!',
      'มาบรรลุเป้าหมายสุขภาพด้วยกันวันนี้!',
      'การเดินทางเพื่อเมตาบอลิซึมของคุณเป็นอย่างไรบ้างวันนี้?',
      'นึกถึงคุณ! คุณได้เคลื่อนไหวร่างกายวันนี้หรือยัง?',
      'น้ำ ผัก การเคลื่อนไหว - คุณติดตามอย่างไรบ้างวันนี้?',
      'แค่มาเช็คดูว่า - ต้องการความช่วยเหลือกับเป้าหมายสุขภาพไหม?',
      'คุณสร้างแรงบันดาลใจให้ฉัน! ความคืบหน้าของคุณสัปดาห์นี้เป็นอย่างไรบ้าง?',
    ],
  };

  async add(
    fromId: number,
    toId: number,
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Check if friendship already exists
      const existingFriendship = await this.friendRepo.findOne({
        where: [
          { USER1_ID: fromId, USER2_ID: toId },
          { USER1_ID: toId, USER2_ID: fromId },
        ],
      });

      if (existingFriendship) {
        return {
          success: false,
          message: 'Friendship already exists',
        };
      }

      const requestData: CreateFriendDto = {
        USER1_ID: fromId,
        USER2_ID: toId,
        REQUESTED_BY_ID: fromId,
      };

      const data = this.friendRepo.create(requestData);
      const savedFriendship = await this.friendRepo.save(data);

      const user1 = await this.getUserData(fromId);
      const user2 = await this.getUserData(toId);

      // send notification to user
      await this.notiHistoryService.create({
        FROM: `${user1.USERNAME}`,
        TO: `${user2.USERNAME}`,
        MESSAGE: `${user1.USERNAME} has added you as a friend, say hi with your friend!`,
        IMAGE_URL: user1.IMAGE_URL,
        APP_ROUTE: APP_ROUTE.Friend,
        UID: toId,
      });

      return {
        success: true,
        message: 'Friend added successfully',
        data: savedFriendship,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to add friend: ' + error.message,
      );
    }
  }

  async search(uid: number) {
    const user = (await this.getUserData(uid)) || null;
    if (user !== null) {
      return {
        UID: user.UID,
        USERNAME: user.USERNAME,
        IMAGE_URL: user.IMAGE_URL,
      };
    }

    return user;
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
      success: true,
      message: 'un-friend successfully',
    };
  }

  async getUserFriends(uid: number): Promise<PaginatedResponse<friendInfo>> {
    const friends = await this.friendRepo.find({
      where: [{ USER1_ID: uid }, { USER2_ID: uid }],
    });

    if (!friends) {
      return {
        data: [],
        meta: { total: [].length },
      };
    }

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
          LAST_LOGIN: friendData.loginStreak?.LAST_LOGIN_DATE || null,
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
    fUid: number,
    query?: {
      stepFromDate?: Date;
      stepToDate?: Date;
      sleepFromDate?: Date;
      sleepToDate?: Date;
    },
  ) {
    const isFriend = await this.isFriend(uid, fUid);
    if (!isFriend) {
      return {
        success: false,
        message: `Friendship between User uid:${uid} and uid:${fUid} do not exists`,
      };
    }

    const friend = await this.getUserData(fUid);

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
      LAST_LOGIN: friend.loginStreak?.LAST_LOGIN_DATE || null,
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
    if (message === null) {
      message = this.getRandomPhrase('thai');
    }
    const data = await this.notiHistoryService.create({
      FROM: `${user1.USERNAME}`,
      TO: `${user2.USERNAME}`,
      MESSAGE: message,
      IMAGE_URL: user1.IMAGE_URL,
      APP_ROUTE: APP_ROUTE.Friend,
      UID: toId,
    });
    return {
      success: true,
      message: `Notify to uid:${toId} successfully`,
      data,
    };
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
    let settings = await this.pvSettingRepo.findOne({
      where: { USER_ID: userId },
    });

    if (!settings) {
      settings = await this.createPvSetting(userId);
      // throw new NotFoundException(
      //   `Privacy settings for user ${userId} not found`,
      // );
    }

    return settings;
  }

  async createPvSetting(userId: number) {
    return await this.pvSettingRepo.save({ USER_ID: userId });
  }

  private async getUserData(uid: number) {
    return await this.userRepo.findOne({
      where: { UID: uid },
      relations: ['league', 'privacy', 'loginStreak'],
    });
  }

  private async isFriend(user1: number, user2: number): Promise<boolean> {
    const friendship = await this.friendRepo.findOne({
      where: [
        { USER1_ID: user1, USER2_ID: user2 },
        { USER1_ID: user2, USER2_ID: user1 },
      ],
    });

    return !!friendship; // Convert to boolean (true if friendship exists, false otherwise)
  }

  private getRandomPhrase(language: 'english' | 'thai'): string {
    // Get current hour in user's timezone
    const userTime = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Bangkok',
    });
    const userHour = new Date(userTime).getHours();

    // Define time ranges
    const isNightTime = userHour >= 20 || userHour < 5; // 8PM-5AM
    const isMorningExerciseTime = userHour >= 5 && userHour < 10; // 5AM-10AM
    const isEveningExerciseTime = userHour >= 17 && userHour < 20; // 5PM-8PM
    const isBreakfastTime = userHour >= 6 && userHour < 9; // 6AM-9AM
    const isLunchTime = userHour >= 11 && userHour < 14; // 11AM-2PM
    const isDinnerTime = userHour >= 17 && userHour < 20; // 5PM-8PM

    // Arrays for each category
    const exercisePhrases = [0, 1, 2, 3, 4];
    const dietPhrases = [5, 6, 7, 8, 9];
    const sleepPhrases = [10, 11, 12, 13, 14];
    const generalPhrases = [15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

    let eligibleIndexes: number[] = [];

    // Select appropriate phrases based on time
    if (isNightTime) {
      // Higher weight for sleep phrases at night
      eligibleIndexes = [...sleepPhrases, ...sleepPhrases, ...generalPhrases];
    } else if (isBreakfastTime || isLunchTime || isDinnerTime) {
      // Higher weight for diet phrases during meal times
      eligibleIndexes = [...dietPhrases, ...dietPhrases, ...generalPhrases];
    } else if (isMorningExerciseTime || isEveningExerciseTime) {
      // Higher weight for exercise phrases during exercise times
      eligibleIndexes = [
        ...exercisePhrases,
        ...exercisePhrases,
        ...generalPhrases,
      ];
    } else {
      // Any time - general mix with a slight preference for activity
      eligibleIndexes = [
        ...generalPhrases,
        ...generalPhrases,
        ...exercisePhrases,
        ...dietPhrases,
        ...sleepPhrases,
      ];
    }

    // Select a random index from the eligible indexes
    const randomIndex =
      eligibleIndexes[Math.floor(Math.random() * eligibleIndexes.length)];

    // Return the phrase in the specified language
    return this.phrases[language][randomIndex];
  }
}
