import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LoginStreakService } from '../services/login-streak.service';
import { CreateLoginStreakDto } from '../dto/create-login-streak.dto';
import { UpdateLoginStreakDto } from '../dto/update-login-streak.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Login Streak')
@Controller('login-streak')
export class LoginStreakController {
  constructor(private readonly loginStreakService: LoginStreakService) {}
  @ApiOperation({ summary: 'Get&Update user login streak' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Login streak updated' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseGuards(JwtAuthGuard)
  @Get('update-login')
  loggedIn(@Request() req) {
    return this.loginStreakService.updateUserLoginStreak(+req.user.UID);
  }

  @ApiOperation({ summary: 'Create new login streak' })
  @ApiResponse({ status: 201, description: 'Login streak created' })
  @ApiResponse({ status: 409, description: 'Login streak already exists' })
  @Post()
  create(@Body() createLoginStreakDto: CreateLoginStreakDto) {
    return this.loginStreakService.createLoginStreak(createLoginStreakDto);
  }

  @ApiOperation({ summary: 'Get all login streaks' })
  @ApiResponse({ status: 200, description: 'Returns all login streaks' })
  @Get()
  findAll() {
    return this.loginStreakService.findAll();
  }

  @ApiOperation({ summary: 'Get login streak by user ID' })
  @ApiParam({ name: 'uid', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns the login streak' })
  @ApiResponse({ status: 404, description: 'Login streak not found' })
  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.loginStreakService.findOne(+uid);
  }

  @ApiOperation({ summary: 'Update login streak' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Login streak updated' })
  @ApiResponse({ status: 404, description: 'Login streak not found' })
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLoginStreakDto: UpdateLoginStreakDto,
  ) {
    return this.loginStreakService.update(+id, updateLoginStreakDto);
  }

  @ApiOperation({ summary: 'Delete login streak' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Login streak deleted' })
  @ApiResponse({ status: 404, description: 'Login streak not found' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loginStreakService.remove(+id);
  }
}
