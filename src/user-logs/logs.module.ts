import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './services/logs.service';
import { LogsController } from './controllers/logs.controller';
import { LogEntity } from '../.typeorm/entities/logs.entity';
import { User } from '../.typeorm/entities/users.entity';
import { HelperModule } from '@/helpers/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([LogEntity, User]), HelperModule],
  controllers: [LogsController],
  providers: [LogsService],
  exports: [LogsService],
})
export class LogsModule {}
