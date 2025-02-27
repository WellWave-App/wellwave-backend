import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserLeaderboard } from '../.typeorm/entities/user-leaderboard.entity';
import { UsersModule } from '@/users/users.module';
import { TasksService } from './services/tasks.services';
import { LeaderboardModule } from '@/leagues/leagues.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserLeaderboard]),
    UsersModule,
    LeaderboardModule,
  ],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
