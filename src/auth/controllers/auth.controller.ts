import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guard/local-auth.guard';
import { GoogleAuthGuard } from '../guard/google-auth.guard';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { LoginResponseDto } from '../dto/login-response.dto';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { RegisterUserDto } from '@/users/dto/register.dto';
import { UsersService } from '@/users/services/users.service';
import { Role } from '../roles/roles.enum';
import { OtpService } from '@/otp/otp.service';
import { Roles } from '../roles/roles.decorator';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { RoleGuard } from '../guard/role.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly otpService: OtpService,
  ) {}

  @ApiOperation({ summary: 'Login with email/password' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Request() req, @Res({ passthrough: true }) res) {
    const { access_token } = await this.authService.login(req.user);
    // save to cookie
    // return msg: login successful
    res.cookie('access_token', access_token, { httpOnly: true });
    // return { accessToken: access_token, message: 'Login successfully' };
    return {
      message: 'Login Successfully',
      accessToken: access_token,
      user: {
        UID: req.user.UID,
        EMAIL: req.user.EMAIL,
        ROLE: req.user.ROLE,
      },
    };
  }

  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        EMAIL: { type: 'string' },
        PASSWORD: { type: 'string' },
        ROLE: {
          type: 'enum',
          enum: Object.values(Role),
          description: "ROLE: 'user', 'admin', 'moderator'",
        },
      },
      required: ['EMAIL', 'PASSWORD'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully created',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  @Post('/register')
  create(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.create(registerUserDto);
  }

  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  @ApiResponse({ status: 302, description: 'Redirects to Google login page' })
  @UseGuards(GoogleAuthGuard)
  @Get('/google')
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
  @Get('/google/callback')
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
  @Get('/logout')
  async logout(@Request() req, @Res() res) {
    res.clearCookie('access_token', {
      httpOnly: true,
    });
    return res.json({ message: 'Successfully logged out' });
  }

  @Post('/forgot-password')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @UseGuards(JwtAuthGuard, RoleGuard)
  async forgotPassword(@Body() body: { EMAIL: string }, @Request() req) {
    try {
      const user = await this.usersService.getByEmail(body.EMAIL);
      // const user = await this.usersService.getById(req.user.UID);

      if (!user) throw new NotFoundException('User not found');

      const otp = await this.otpService.generateOTP(user);
      // Send OTP via email
      await this.otpService.sendOtp(body.EMAIL, otp);

      return { message: 'OTP sent to your email' };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to process request',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('/reset-password')
  async resetPassword(
    @Body() body: { EMAIL: string; OTP: string; NEW_PASSWORD: string },
  ) {
    const user = await this.usersService.getByEmail(body.EMAIL);
    if (!user) throw new NotFoundException('User not found');

    // Verify OTP
    await this.otpService.verifyOTP(user.UID, body.OTP);

    // Reset password
    const data = await this.usersService.updatePassword(
      user.UID,
      body.NEW_PASSWORD,
    );

    return { message: 'Password updated successfully', data };
  }
}
