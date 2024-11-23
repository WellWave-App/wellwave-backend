import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HabitController } from './habit.controller';
import { HabitService } from './habit.service';
import { QuestModule } from '../quest/quest.module';
import { HabitEntity } from '../.typeorm/entities/habit.entity';
import { UserHabitTrackEntity } from '../.typeorm/entities/user-habit-track.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    forwardRef(() => QuestModule),
    UsersModule,
    TypeOrmModule.forFeature([HabitEntity, UserHabitTrackEntity]),
  ],
  controllers: [HabitController],
  providers: [HabitService],
  exports: [HabitService],
})
export class HabitModule {}
