import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/.typeorm/entities/users.entity';
import { Habits } from '@/.typeorm/entities/habit.entity';
import { Quest } from '@/.typeorm/entities/quest.entity';
import { Article } from '@/.typeorm/entities/article.entity';
import { Achievement } from '@/.typeorm/entities/achievement.entity';
import { ShopItem } from '@/.typeorm/entities/shop-items.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Habits, Quest, Article, Achievement, ShopItem]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
