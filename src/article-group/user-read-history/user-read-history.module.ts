import { Module } from '@nestjs/common';
import { UserReadHistoryService } from './services/user-read-history.service';
import { UserReadHistoryController } from './controllers/user-read-history.controller';

@Module({
  controllers: [UserReadHistoryController],
  providers: [UserReadHistoryService],
})
export class UserReadHistoryModule {}
