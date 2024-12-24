import { Module } from '@nestjs/common';
import { UserReadArticleService } from './services/user-read-article.service';
import { UserReadArticleController } from './controllers/user-read-article.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserReadHistory])],
  controllers: [UserReadArticleController],
  providers: [UserReadArticleService],
})
export class UserReadArticleModule {}
