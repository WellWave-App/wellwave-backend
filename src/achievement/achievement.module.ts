import { Module } from '@nestjs/common';
import { AchievementService } from './achievement.service';
import { AchievementController } from './achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from './entities/achievement.entity';
import { AchievementLevel } from './entities/achievement_level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, AchievementLevel])],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
