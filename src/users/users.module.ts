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
    TypeOrmModule.forFeature([User, UserReadHistory, UserHabits]),
    LogsModule,
    LoginStreakModule,
    ImageModule,
    forwardRef(() => RecommendationModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
