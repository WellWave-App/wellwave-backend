import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './services/logs.service';
import { LogsController } from './controllers/logs.controller';
import { LogEntity } from '../.typeorm/entities/logs.entity';
import { UserEntity } from '../.typeorm/entities/users.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, UserEntity])],
  controllers: [LogsController],
  providers: [LogsService],
})
export class LogsModule {}
