import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from '../.typeorm/entities/users.entity';
import { LogsModule } from '@/user-logs/logs.module';
import { LoginStreakModule } from '@/login-streak/login-streak.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageModule } from '@/image/image.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    LogsModule,
    LoginStreakModule,
    ImageModule,
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
