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
    TypeOrmModule.forFeature([Habits, UserHabits, DailyHabitTrack]),
    ImageModule,
    QuestModule,
    LogsModule,
    UsersModule,
    HelperModule,
  ],
  controllers: [HabitController],
  providers: [HabitService, ExerciseCalculator],
  exports: [HabitService, ExerciseCalculator],
})
export class HabitModule {}
