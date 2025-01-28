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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Quest,
      UserQuests,
      QuestProgress,
      DailyHabitTrack,
    ]),
    ImageModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `article-${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [QuestController],
  providers: [
    QuestService,
    // QuestRepository, UserQuestRepository
  ],
  exports: [QuestService],
})
export class QuestModule {}
