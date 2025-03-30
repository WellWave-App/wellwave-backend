import { Module } from '@nestjs/common';
import { HabitController } from './controllers/habit.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Habits } from '../../.typeorm/entities/habit.entity';
import { UserHabits } from '../../.typeorm/entities/user-habits.entity';
import { DailyHabitTrack } from '../../.typeorm/entities/daily-habit-track.entity';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
// import { HabitRepository } from './repositories/habit.repository';
// import { UserHabitRepository } from './repositories/user-habit.repository';
import { HabitService } from './services/habit.service';
import { QuestModule } from '../quest/quest.module';
import { LogsModule } from '@/user-logs/logs.module';
import { ExerciseCalculator } from './utils/exercise-calculator.util';
import { UsersModule } from '@/users/users.module';
import { HelperModule } from '@/helpers/helper.module';
import { User } from '@/.typeorm/entities/users.entity';
import { RecommendationModule } from '@/recommendation/recommendation.module';
import { UserQuests } from '@/.typeorm/entities/user-quests.entity';
import { AchievementModule } from '@/achievement/achievement.module';
import { LogEntity } from '@/.typeorm/entities/logs.entity';
import { Quest } from '@/.typeorm/entities/quest.entity';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `habit-thumnail-${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
    TypeOrmModule.forFeature([
      Habits,
      UserHabits,
      DailyHabitTrack,
      User,
      UserQuests,
      LogEntity,
      Quest,
    ]),
    ImageModule,
    QuestModule,
    LogsModule,
    UsersModule,
    HelperModule,
    RecommendationModule,
    AchievementModule,
  ],
  controllers: [HabitController],
  providers: [HabitService, ExerciseCalculator],
  exports: [HabitService, ExerciseCalculator],
})
export class HabitModule {}
