import {
  RequirementEntity,
  TrackableProperty,
} from '@/.typeorm/entities/achievement.entity';
import { UserItems } from '@/.typeorm/entities/user-items.entity';
import { User } from '@/.typeorm/entities/users.entity';
import { AchievementService } from '@/achievement/services/achievement.service';
import { DateService } from '@/helpers/date/date.services';
import { ShopItemType } from '@/shop/enum/item-type.enum';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';

export class RewardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserItems)
    private readonly userItemsRepo: Repository<UserItems>,
    private readonly dateService: DateService,
    private readonly achievementService: AchievementService,
  ) {}

  private maxMultiplier = 2.5;
  async rewardUser(
    uid: number,
    reward: {
      gem?: number;
      exp?: number;
    },
  ) {
    const user = await this.userRepo.findOne({
      where: {
        UID: uid,
      },
      relations: ['userItems'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    const totalMultiplier = await this.calculateUserExpMultiplier(uid);
    const expReward = reward.exp ? reward.exp * totalMultiplier : 0;
    const gemReward = reward.gem ? reward.gem : 0;

    user.EXP += expReward || 0;
    user.GEM += gemReward || 0;

    if (reward.exp > 0) {
      await this.achievementService.trackProgress({
        uid: user.UID,
        entity: RequirementEntity.USER,
        property: TrackableProperty.TOTAL_EXP,
        value: expReward,
        date: new Date(this.dateService.getCurrentDate().timestamp),
      });
    }
  }

  async calculateUserExpMultiplier(userId: number): Promise<number> {
    // Find all active EXP boosters for the user
    const activeUserBoosters = await this.userItemsRepo.find({
      where: {
        UID: userId,
        IS_ACTIVE: true,
        EXPIRE_DATE: MoreThan(
          new Date(this.dateService.getCurrentDate().timestamp),
        ), // Not expired
        item: {
          ITEM_TYPE: ShopItemType.EXP_BOOST,
        },
      },
      relations: ['item', 'item.expBooster'],
    });

    if (activeUserBoosters.length === 0) {
      return 1.0; // No boosters, return base multiplier
    }

    // Multiplicative approach (boosts multiply each other)
    let multiplicativeMultiplier = 1.0;
    for (const userBooster of activeUserBoosters) {
      multiplicativeMultiplier *= userBooster.item.expBooster.BOOST_MULTIPLIER;
    }

    return multiplicativeMultiplier >= this.maxMultiplier
      ? this.maxMultiplier
      : multiplicativeMultiplier;
  }

  async pay(uid: number, coin: { gem?: number; exp?: number }) {
    const user = await this.userRepo.findOne({
      where: {
        UID: uid,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    if (coin.gem && user.GEM < coin.gem) {
      throw new Error('Not enough gem');
    } else if (coin.exp && user.EXP < coin.exp) {
      throw new Error('Not enough exp');
    }

    const today = new Date(this.dateService.getCurrentDate().timestamp);
    user.GEM -= coin.gem || 0;
    if (coin.gem > 0) {
      await this.achievementService.trackProgress({
        uid: user.UID,
        entity: RequirementEntity.USER_GEM_USAGE,
        property: TrackableProperty.TOTAL_GEMS_SPENT,
        value: coin.gem,
        date: today,
      });
    }
    user.EXP -= coin.exp || 0;
    // todo: implement achievement tracking
    await this.userRepo.save(user);

    return {
      message: 'success',
      status: 200,
    };
  }
}
