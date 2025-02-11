import { Module } from '@nestjs/common';
import { AchievementService } from './services/achievement.service';
import { AchievementController } from './controllers/achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../.typeorm/entities/achievement.entity';
import { AchievementLevel } from '../.typeorm/entities/achievement_level.entity';
import { UserAchieved } from '../.typeorm/entities/user_achieved.entity';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AchievementTrackingHistory } from '../.typeorm/entities/achievement_tracking_history.entity';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `achievement_${Date.now()}_${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    TypeOrmModule.forFeature([
      Achievement,
      AchievementLevel,
      UserAchieved,
      AchievementTrackingHistory,
    ]),
    ImageModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
})
export class AchievementModule {}
