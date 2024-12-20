import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { GoogleAuthGuard } from '../guard/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token } = await this.authService.login(req.user);
    // save to cookie
    // return msg: login successful
    res.cookie('access_token', access_token, { httpOnly: true });
    // return { accessToken: access_token, message: 'Login successfully' };
    return { message: 'Login Successfully', accessToken: access_token };
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // init google auth process
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Request() req, @Res({ passthrough: true }) res) {
    try {
      const { access_token } = await this.authService.googleLogin(req);
      res.cookie('access_token', access_token, { httpOnly: true });
      return { message: 'Login Successfully' };
    } catch (error) {
      console.error('Google login error:', error);
      throw new HttpException(
        error.message || 'Google login failed',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('logout')
  async logout(@Request() req, @Res() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
    });
    return res.json({ message: 'Successfully logged out' });
  }
}
