import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestController } from './quest.controller';
import { QuestService } from './quest.service';
import { QuestEntity } from '../.typeorm/entities/quest.entity';
import { UserEntity } from 'src/.typeorm/entities/users.entity';
import { UsersModule } from 'src/users/users.module';
import { HabitModule } from 'src/habit/habit.module';
import { HabitEntity } from 'src/.typeorm/entities/habit.entity';
import { UserHabitTrackEntity } from 'src/.typeorm/entities/user-habit-track.entity';
import { UserQuestEntity } from '../.typeorm/entities/user-quest.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QuestEntity,
      UserQuestEntity,
      UserEntity,
      UserHabitTrackEntity,
      HabitEntity,
    ]),
    UsersModule,
    forwardRef(() => HabitModule),
  ],
  controllers: [QuestController],
  providers: [QuestService],
  exports: [QuestService],
})
export class QuestModule {}
