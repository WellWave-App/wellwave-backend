import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OtpService } from './otp.service';
import { CreateOtpDto } from './dto/create-otp.dto';
import { UpdateOtpDto } from './dto/update-otp.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private mailerService: MailerService,
  ) {}

  @Get('/mail')
  async sendMail() {
    try {
      await this.mailerService.sendMail({
        to: 'heartof.effort@gmail.com',
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Your OTP code is: <strong style="font-size: 24px;">hello test</strong></p>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send OTP email');
    }
  }
}
