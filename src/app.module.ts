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
import { LoginStreakModule } from './login-streak/login-streak.module';
import { NotiSettingModule } from './noti-setting/noti-setting.module';
import { ImageModule } from './image/image.module';
import { ArticleModule } from './article-group/article/article.module';
import { DiseaseTypesModule } from './disease-types/disease-types.module';
import { UserReadHistoryModule } from './article-group/user-read-history/user-read-history.module';
import { RecommendationModule } from './recommendation/recommendation.module';
import { QuestModule } from './mission/quest/quest.module';
import { HabitModule } from './mission/habit/habit.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { FilterAdminInterceptor } from './Interceptors/filterAdmin.interceptor';
import { CheckinChallengeModule } from './checkin-challenge/checkin-challenge.module';
import { AchievementModule } from './achievement/achievement.module';
import { LeaderboardModule } from './leagues/leagues.module';
import { OtpModule } from './otp/otp.module';
import { NotificationHistoryModule } from './notification_history/notification_history.module';
import { HelperModule } from './helpers/helper.module';
import { TestingModule } from '@nestjs/testing';
import { ScheduleModule } from '@nestjs/schedule';
import { TasksModule } from './scheduler/tasks.module';
import { ShopModule } from './shop/shop.module';
import { FriendModule } from './friend/friend.module';
import { AdminModule } from './admin/admin.module';

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
        synchronize: false,
        timezone: 'Asia/Bangkok',
        extra: {
          timezone: 'Asia/Bangkok',
        },
        dateStrings: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    LogsModule,
    AuthModule,
    RiskAssessmentModule,
    LoginStreakModule,
    NotiSettingModule,
    ImageModule,
    ArticleModule,
    DiseaseTypesModule,
    UserReadHistoryModule,
    RecommendationModule,
    QuestModule,
    HabitModule,
    CheckinChallengeModule,
    AchievementModule,
    LeaderboardModule,
    OtpModule,
    NotificationHistoryModule,
    HelperModule,
    TestingModule,
    ScheduleModule.forRoot(),
    TasksModule,
    ShopModule,
    FriendModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: FilterAdminInterceptor },
  ],
})
export class AppModule {}
