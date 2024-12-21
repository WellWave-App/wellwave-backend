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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoginResponseDto } from '../dto/login-response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
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

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page' })
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  async googleAuth() {
    // init google auth process
  }

  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({
    status: 200,
    description: 'Google login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 500, description: 'Google login failed' })
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

  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({
    status: 200,
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Successfully logged out',
        },
      },
    },
  })
  @Get('logout')
  async logout(@Request() req, @Res() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
    });
    return res.json({ message: 'Successfully logged out' });
  }
}
