import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OTP } from '../.typeorm/entities/otp.entity';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([OTP]),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'your-email@kmitlgmail.com',
          pass: process.env.GMAIL_APP_PASSWORD || 'your-appw-password',
        },
      },
      defaults: {
        from: '"Wellwave" <your-email@kmitlgmail.com>',
      },
    }),
  ],
  controllers: [OtpController],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
