import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { LogsModule } from './user-logs/logs.module';
import { RiskAssessmentModule } from './risk_assessment/risk_assessment.module';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { QuestModule } from './quest/quest.module';
import { HabitModule } from './habit/habit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: +configService.get<number>('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        entities: [
          join(__dirname, '.typeorm', 'entities', '*.entity{.ts,.js}'),
        ],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LogsModule,
    AuthModule,
    QuestModule,
    HabitModule,
    RiskAssessmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
