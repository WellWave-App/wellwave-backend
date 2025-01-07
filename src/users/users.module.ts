import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserReadHistory]),
    LogsModule,
    LoginStreakModule,
    ImageModule,
    // UserReadHistoryModule,
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `user-${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
