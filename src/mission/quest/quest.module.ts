import { Module } from '@nestjs/common';
import { QuestService } from './quest.service';
import { QuestController } from './quest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from '../../.typeorm/entities/quest.entity';
import { UserQuests } from '../../.typeorm/entities/user-quests.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, UserQuests])],
  controllers: [QuestController],
  providers: [QuestService],
})
export class QuestModule {}
