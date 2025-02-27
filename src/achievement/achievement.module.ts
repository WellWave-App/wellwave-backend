import { BadRequestException, Module } from '@nestjs/common';
import { AchievementService } from './services/achievement.service';
import { AchievementController } from './controllers/achievement.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Achievement } from '../.typeorm/entities/achievement.entity';
import { AchievementLevel } from '../.typeorm/entities/achievement_level.entity';
import { UserAchievementProgress } from '../.typeorm/entities/user-achievement-progress.entity';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UserAchieved } from '../.typeorm/entities/user-achieved.entity';
import { User } from '@/.typeorm/entities/users.entity';
import { NotificationHistoryModule } from '@/notification_history/notification_history.module';

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
      fileFilter: (req, file, cb) => {
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/gif',
        ];
        if (!allowedTypes.includes(file.mimetype)) {
          // Reject the file with a custom error message
          return cb(
            new BadRequestException(
              `Invalid file type: ${file.mimetype}. Only JPEG, PNG, JPG, and GIF are allowed.`,
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
    TypeOrmModule.forFeature([
      Achievement,
      AchievementLevel,
      UserAchievementProgress,
      UserAchieved,
      User,
    ]),
    ImageModule,
    NotificationHistoryModule,
    AchievementModule,
  ],
  controllers: [AchievementController],
  providers: [AchievementService],
  exports: [AchievementService],
})
export class AchievementModule {}
