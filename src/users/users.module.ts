import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './services/users.service';
import { UsersController } from './controllers/users.controller';
import { UserEntity } from '../.typeorm/entities/users.entity';
import { LogsModule } from '@/user-logs/logs.module';
import { LoginStreakModule } from '@/login-streak/login-streak.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    LogsModule,
    LoginStreakModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
