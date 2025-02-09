import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../.typeorm/entities/achievement.entity';
import { AchievementLevel } from '../.typeorm/entities/achievement_level.entity';
import { UserAchieved } from '../.typeorm/entities/user_achieved.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, AchievementLevel, UserAchieved])],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
