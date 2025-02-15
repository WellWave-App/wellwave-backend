import { BadRequestException, Module } from '@nestjs/common';
import { NotificationHistoryService } from './notification_history.service';
import { NotificationHistoryController } from './notification_history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationHistory } from '../.typeorm/entities/notification_history.entity';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `noti_${Date.now()}_${file.originalname}`;
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
    TypeOrmModule.forFeature([NotificationHistory]),
    ImageModule,
  ],
  controllers: [NotificationHistoryController],
  providers: [NotificationHistoryService],
  exports: [NotificationHistoryService],
})
export class NotificationHistoryModule {}
