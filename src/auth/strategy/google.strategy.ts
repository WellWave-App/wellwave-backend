import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    access_token: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, photos, _json } = profile;
    const { givenName, familyName } = profile.name || {};
    // Extract year of birth if available
    let yearOfBirth: number | null = null;
    if (_json && _json.birthday) {
      const birthdayParts = _json.birthday.split('-');
      if (birthdayParts.length === 3) {
        yearOfBirth = parseInt(birthdayParts[0], 10);
      }
    }
    // Map gender to boolean
    let gender: boolean | null = null;
    if (_json && _json.gender) {
      if (_json.gender.toLowerCase() === 'male') {
        gender = true;
      } else if (_json.gender.toLowerCase() === 'female') {
        gender = false;
      }
      // If gender is neither 'male' nor 'female', it remains null
    }
    const user = {
      GOOGLE_ID: id,
      EMAIL: emails[0].value,
      USERNAME: `${givenName} ${familyName}`.trim(),
      IMAGE_URL: photos[0].value,
      YEAR_OF_BIRTH: yearOfBirth,
      GENDER: gender,
      access_token,
      // // Set default values for required fields
      // GEM: 0,
      // EXP: 0,
      // USER_GOAL: USER_GOAL.STAY_HEALTHY, // Default goal
      // // Optional fields
      // HEIGHT: null,
      // WEIGHT: null,
      // REMINDER_NOTI_TIME: null,
      // // We don't set UID, PASSWORD, createAt, or LOGS here
    };

    done(null, user);
  }
}
