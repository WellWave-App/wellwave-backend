import { Module, forwardRef } from '@nestjs/common';
import { LeaderboardController } from './controllers/leagues.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLeaderboard } from '../.typeorm/entities/user-leaderboard.entity';
import { LeaderboardService } from './services/leagues.service';
import { UsersModule } from '@/users/users.module';
import { User } from '@/.typeorm/entities/users.entity';
import { HelperModule } from '@/helpers/helper.module';
import { AchievementModule } from '@/achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLeaderboard, User]),
    HelperModule,
    AchievementModule,
  ],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
  exports: [LeaderboardService],
})
export class LeaderboardModule {}
