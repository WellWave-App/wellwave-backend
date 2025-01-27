import { Module } from '@nestjs/common';
import { QuestService } from './services/quest.service';
import { QuestController } from './controllers/quest.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quest } from '../../.typeorm/entities/quest.entity';
import { UserQuests } from '../../.typeorm/entities/user-quests.entity';
// import { QuestRepository } from './repositories/quest.repository';
// import { UserQuestRepository } from './repositories/user-quest.repository';
import { QuestProgress } from '../../.typeorm/entities/quest-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quest, UserQuests, QuestProgress])],
  controllers: [QuestController],
  providers: [
    QuestService,
    // QuestRepository, UserQuestRepository
  ],
  exports: [QuestService],
})
export class QuestModule {}
