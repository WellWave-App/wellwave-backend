import { Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guard/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    const { access_token } = await this.authService.login(req.user);
    return { accessToken: access_token };
  }
}
