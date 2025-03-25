import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrivateSetting } from '../.typeorm/entities/user-privacy.entity';
import { Friend } from '../.typeorm/entities/friend.entity';
import { NotificationHistoryModule } from '@/notification_history/notification_history.module';
import { UsersModule } from '@/users/users.module';
import { User } from '@/.typeorm/entities/users.entity';
import { LogsModule } from '@/user-logs/logs.module';
import { HelperModule } from '@/helpers/helper.module';
import { AchievementModule } from '@/achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Friend, PrivateSetting, User]),
    NotificationHistoryModule,
    UsersModule,
    LogsModule,
    HelperModule,
    AchievementModule
  ],
  controllers: [FriendController],
  providers: [FriendService],
})
export class FriendModule {}
