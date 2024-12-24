import { Module } from '@nestjs/common';
import { UserReadHistoryService } from './user-read-history.service';
import { UserReadHistoryController } from './user-read-history.controller';

@Module({
  controllers: [UserReadHistoryController],
  providers: [UserReadHistoryService],
})
export class UserReadHistoryModule {}
