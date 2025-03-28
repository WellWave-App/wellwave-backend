import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { User } from '../.typeorm/entities/users.entity';
import { LogsModule } from '@/user-logs/logs.module';
import { LoginStreakModule } from '@/login-streak/login-streak.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageModule } from '@/image/image.module';
import { UserReadHistoryModule } from '@/article-group/user-read-history/user-read-history.module';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { UserHabits } from '@/.typeorm/entities/user-habits.entity';
import { HabitModule } from '@/mission/habit/habit.module';
import { RecommendationModule } from '@/recommendation/recommendation.module';
import { CheckinChallengeModule } from '@/checkin-challenge/checkin-challenge.module';
import { UserQuests } from '@/.typeorm/entities/user-quests.entity';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { HelperModule } from '@/helpers/helper.module';
import { AchievementModule } from '@/achievement/achievement.module';
import { LeaderboardModule } from '@/leagues/leagues.module';
import { RewardService } from './services/reward.service';
import { UserItems } from '@/.typeorm/entities/user-items.entity';
import { ShopItem } from '@/.typeorm/entities/shop-items.entity';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `user-${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      UserReadHistory,
      UserHabits,
      UserQuests,
      DailyHabitTrack,
      UserItems,
      ShopItem,
    ]),
    forwardRef(() => RecommendationModule),
    LogsModule,
    LoginStreakModule,
    ImageModule,
    CheckinChallengeModule,
    HelperModule,
    AchievementModule,
    LeaderboardModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, RewardService],
  exports: [UsersService, RewardService],
})
export class UsersModule {}
