import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CheckinChallengeService } from '../services/checkin-challenge.service';
import { CreateCheckinChallengeDto } from '../dto/create-checkin-challenge.dto';
import { UpdateCheckinChallengeDto } from '../dto/update-checkin-challenge.dto';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';

@ApiBearerAuth('Authorization header needed')
@ApiTags('Check-in Challenge')
@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('checkin-challenge')
export class CheckinChallengeController {
  constructor(private readonly checkingService: CheckinChallengeService) {}

  @Get('/stats')
  @Roles(Role.USER, Role.ADMIN, Role.MODERATOR)
  @ApiOperation({ summary: 'Get check-in stats (Authorization header needed)' })
  @ApiResponse({
    status: 200,
    description: 'Returns check-in statistics for a user',
    schema: {
      example: {
        checkInStats: [
          { day: 1, isLogin: true, rewardAmount: 5 },
          { day: 2, isLogin: false, rewardAmount: 5 },
        ],
        overallStats: {
          UID: 1,
          STREAK_START_DATE: '2024-02-06T10:00:00Z',
          LAST_LOGIN_DATE: '2024-02-06T10:00:00Z',
          CURRENT_STREAK: 1,
          LONGEST_STREAK: 1,
          TOTAL_POINTS_EARNED: 5,
        },
      },
    },
  })
  // @ApiBody({
  //   schema: {
  //     properties: {
  //       UID: {
  //         type: 'number',
  //         description: 'User ID (optional, defaults to authenticated user)',
  //         example: 1,
  //       },
  //     },
  //   },
  //   required: false,
  // })
  getCheckInStats(@Req() req, @Body() body: { UID: number }) {
    const uid = body.UID === null ? req.user.UID : body.UID;
    return this.checkingService.getStats(uid);
  }

  @Post('/check')
  @Roles(Role.MODERATOR, Role.ADMIN, Role.USER)
  @ApiOperation({
    summary: 'Record daily check-in (Authorization header needed)',
  })
  @ApiResponse({
    status: 201,
    description: 'Successfully checked in',
    schema: {
      example: {
        checkInStats: [{ day: 1, isLogin: true, rewardAmount: 5 }],
        overallStats: {
          UID: 1,
          CURRENT_STREAK: 1,
          TOTAL_POINTS_EARNED: 5,
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Already checked in today' })
  @ApiBody({
    schema: {
      properties: {
        DATE: {
          type: 'string',
          format: 'date-time',
          example: '2024-02-06T10:00:00Z',
        },
      },
    },
  })
  updateTodayChecking(@Body() body: { DATE: string }, @Req() req) {
    const { DATE } = body;
    return this.checkingService.updateTodayCheckin(
      req.user.UID,
      new Date(DATE),
    );
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create check-in record (Admin only)' })
  @ApiResponse({ status: 201, description: 'Check-in record created' })
  @ApiResponse({ status: 409, description: 'Record already exists' })
  create(@Body() createCheckinChallengeDto: CreateCheckinChallengeDto) {
    return this.checkingService.create(createCheckinChallengeDto);
  }

  @Get('/:uid')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get check-in record by UID (Admin only)' })
  @ApiParam({ name: 'uid', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Returns check-in record' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  findOne(@Param('id') id: string) {
    return this.checkingService.findOne(+id);
  }

  @Patch()
  @Roles(Role.USER, Role.ADMIN)
  @ApiOperation({ summary: 'Update check-in record' })
  @ApiResponse({ status: 200, description: 'Record updated' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  update(@Body() updateCheckinChallengeDto: UpdateCheckinChallengeDto) {
    return this.checkingService.update(updateCheckinChallengeDto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete check-in record (Admin only)' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Record deleted' })
  @ApiResponse({ status: 404, description: 'Record not found' })
  remove(@Param('id') id: string) {
    return this.checkingService.remove(+id);
  }
}
