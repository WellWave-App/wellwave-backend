import { forwardRef, Module } from '@nestjs/common';
import { UserReadHistoryService } from './services/user-read-history.service';
import { UserReadHistoryController } from './controllers/user-read-history.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { UsersModule } from '@/users/users.module';
import { UserReadHistoryReposity } from './repositories/user-read-history.repository';
import { ArticleModule } from '../article/article.module';
import { AchievementModule } from '@/achievement/achievement.module';
import { HelperModule } from '@/helpers/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserReadHistory]),
    forwardRef(() => UsersModule),
    forwardRef(() => ArticleModule),
    AchievementModule,
    HelperModule,
  ],
  controllers: [UserReadHistoryController],
  providers: [UserReadHistoryService, UserReadHistoryReposity],
  exports: [UserReadHistoryService, UserReadHistoryReposity],
})
export class UserReadHistoryModule {}
