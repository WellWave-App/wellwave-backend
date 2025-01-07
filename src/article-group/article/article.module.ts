import { Module } from '@nestjs/common';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../../.typeorm/entities/article.entity';
import { UserReadHistory } from '../../.typeorm/entities/user-read-history.entity';
import { DiseaseType } from '../../.typeorm/entities/disease-types.entity';
import { ArticleRepository } from './repositories/article.repository';
import { DiseaseTypesModule } from '@/disease-types/disease-types.module';
import { ImageModule } from '@/image/image.module';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { RecommendationModule } from '@/recommendation/recommendation.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, UserReadHistory, DiseaseType]),
    DiseaseTypesModule,
    ImageModule,
    // RecommendationModule,
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
  controllers: [ArticleController],
  providers: [ArticleService, ArticleRepository],
  exports: [ArticleService, ArticleRepository],
})
export class ArticleModule {}
