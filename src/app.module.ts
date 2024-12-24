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
import { ArticleModule } from './article/article.module';
import { DiseaseTypesModule } from './disease-types/disease-types.module';
import { UserReadArticleModule } from './user-read-article/user-read-article.module';

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
    RiskAssessmentModule,
    LoginStreakModule,
    NotiSettingModule,
    ImageModule,
    ArticleModule,
    DiseaseTypesModule,
    UserReadArticleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
