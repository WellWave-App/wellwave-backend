import { BadRequestException, Module } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ShopController } from './shop.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopItem } from '../.typeorm/entities/shop-items.entity';
import { UserItems } from '../.typeorm/entities/user-items.entity';
import { ExpBooster } from '../.typeorm/entities/exp-booster.entity';
import { GemExchange } from '../.typeorm/entities/gem-exhange.entity';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ImageModule } from '@/image/image.module';
import { MysteryBox } from '../.typeorm/entities/mystery-box.entity';
import { HelperModule } from '@/helpers/helper.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './assets/images',
        filename: (req, file, cb) => {
          const filename = `items_${Date.now()}_${file.originalname}`;
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
      ShopItem,
      UserItems,
      ExpBooster,
      GemExchange,
      MysteryBox,
    ]),
    ImageModule,
    HelperModule,
    UsersModule,
  ],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
