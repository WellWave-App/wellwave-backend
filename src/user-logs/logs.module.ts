import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './services/logs.service';
import { LogsController } from './controllers/logs.controller';
import { LogEntity } from '../typeorm/entities/log.entity';
import { User } from '../typeorm/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, User])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}