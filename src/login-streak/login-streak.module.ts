import { Module } from '@nestjs/common';
import { LoginStreakService } from './login-streak.service';
import { LoginStreakController } from './login-streak.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginStreakEntity } from '../.typeorm/entities/login-streak.entity';
import { LoginHistoryEntity } from '../.typeorm/entities/login-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoginStreakEntity, LoginHistoryEntity])],
  controllers: [LoginStreakController],
  providers: [LoginStreakService],
  exports: [LoginStreakService],
})
export class LoginStreakModule {}
