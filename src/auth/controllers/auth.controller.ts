import { Controller, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guard/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token } = await this.authService.login(req.user);
    // save to cookie
    // return msg: login successful
    res.cookie('accessToken', access_token, { httpOnly: true });
    return { accessToken: access_token, message: 'Login successfully' };
  }
}
