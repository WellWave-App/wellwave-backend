import { Module } from '@nestjs/common';
import { ArticleController } from './controllers/article.controller';
import { ArticleService } from './services/article.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from '../.typeorm/entities/article.entity';
import { ArticleDiseasesRelated } from '../.typeorm/entities/article-diseases-related.entity';
import { UserReadHistory } from '../.typeorm/entities/user-read-history.entity';
import { DiseaseType } from '../.typeorm/entities/disease-types.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Article,
      ArticleDiseasesRelated,
      UserReadHistory,
      DiseaseType,
    ]),
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
