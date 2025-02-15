import { User } from '@/.typeorm/entities/users.entity';
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { OTP } from '../.typeorm/entities/otp.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(OTP)
    private readonly otpRepository: Repository<OTP>,
    private mailerService: MailerService,
  ) {}

  async generateOTP(user: User) {
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(
      new Date().toLocaleString('en-US', {
        timeZone: 'Asia/Bangkok',
      }),
    );
    expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 10 minutes validity

    const otp = await this.otpRepository.findOne({
      where: {
        UID: user.UID,
      },
    });

    if (!otp) {
      await this.otpRepository.save({
        UID: user.UID,
        OTP: otpCode,
        EXPIRES_AT: expiresAt,
        IS_USED: false,
      });
    } else {
      await this.otpRepository.update(
        { UID: user.UID },
        {
          OTP: otpCode,
          EXPIRES_AT: expiresAt,
          IS_USED: false,
        },
      );
    }

    return otpCode;
  }

  async verifyOTP(userId: number, otp: string) {
    const otpRecord = await this.otpRepository.findOne({
      where: {
        UID: userId,
        OTP: otp,
        IS_USED: false,
        EXPIRES_AT: MoreThan(
          new Date(
            new Date().toLocaleString('en-US', {
              timeZone: 'Asia/Bangkok',
            }),
          ),
        ),
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    // Mark OTP as used
    otpRecord.IS_USED = true;
    await this.otpRepository.save(otpRecord);

    return true;
  }

  async sendOtp(email: string, otp: string) {
    try {
      // const otp = await this.generateOTP(user);
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Your OTP code is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p>This code will expire in 5 minutes.</p>
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
