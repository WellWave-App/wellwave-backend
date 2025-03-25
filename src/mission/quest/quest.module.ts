import { Module } from '@nestjs/common';
import { QuestService } from './services/quest.service';
import { QuestController } from './controllers/quest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from '../../.typeorm/entities/quest.entity';
import { UserQuests } from '../../.typeorm/entities/user-quests.entity';
import { QuestProgress } from '../../.typeorm/entities/quest-progress.entity';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { DailyHabitTrack } from '@/.typeorm/entities/daily-habit-track.entity';
import { UserHabits } from '@/.typeorm/entities/user-habits.entity';
import { HelperModule } from '@/helpers/helper.module';
import { UsersModule } from '@/users/users.module';
import { AchievementModule } from '@/achievement/achievement.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quest,
      UserQuests,
      QuestProgress,
      DailyHabitTrack,
      UserHabits,
    ]),
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `article-${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    ImageModule,
    HelperModule,
    UsersModule,
    AchievementModule,
  ],
  controllers: [QuestController],
  providers: [
    QuestService,
    // QuestRepository, UserQuestRepository
  ],
  exports: [QuestService],
})
export class QuestModule {}
