import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Req,
  UseGuards,
  Query,
} from '@nestjs/common';
import { FriendService } from './friend.service';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { Role } from '@/auth/roles/roles.enum';
import { Roles } from '@/auth/roles/roles.decorator';
import { PrivateSetting } from '@/.typeorm/entities/user-privacy.entity';
import { UpdatePrivacySettingsDto } from './dto/update-pv.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get('/user-friends')
  getUserFriends(@Req() req, @Query('uid') uid?: number) {
    if (uid !== null) {
      uid = req.user.UID;
    }
    return this.friendService.getUserFriends(+uid);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post('/add/:uid')
  add(@Req() req, @Param('uid') uid: number) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.add(+fromId, +toId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get('/search/:uid')
  search(@Param('uid') uid: number) {
    return this.friendService.search(uid);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post('/unfriend/:uid')
  unfriend(@Req() req, @Param('uid') uid: number) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.unfriend(+fromId, +toId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get('/friend-profile/:uid')
  getFriendProfle(
    @Req() req,
    @Param('uid') uid: number,
    @Query()
    query?: {
      stepFromDate?: string;
      stepToDate?: string;
      sleepFromDate?: string;
      sleepToDate?: string;
    },
  ) {
    return this.friendService.getFriendProfle(req.user.UID, uid, {
      sleepFromDate: query?.sleepFromDate
        ? new Date(query.sleepFromDate)
        : null,
      sleepToDate: query?.sleepToDate ? new Date(query.sleepToDate) : null,
      stepFromDate: query?.stepFromDate ? new Date(query.stepFromDate) : null,
      stepToDate: query?.stepToDate ? new Date(query.stepToDate) : null,
    });
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post('/send-noti/:uid')
  sendNoti(
    @Req() req,
    @Param('uid') uid: number,
    @Body()
    body?: {
      MESSAGE?: string;
    },
  ) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.sendNoti(+fromId, +toId, body.MESSAGE || null);
  }

  @Patch('/privacy')
  async updateUserPrivacySettings(
    @Req() req,
    @Body() updateDto: UpdatePrivacySettingsDto,
    @Query('userId') userId?: number,
  ): Promise<PrivateSetting> {
    if (userId !== null) {
      userId = req.user.UID;
    }
    return this.friendService.updatePrivacySettings(+userId, updateDto);
  }

  @Get('/privacy')
  async getUserPrivacySettings(
    @Req() req,
    @Query('userId') userId?: number,
  ): Promise<PrivateSetting> {
    if (userId !== null) {
      userId = req.user.UID;
    }
    return this.friendService.getPrivacySettings(userId);
  }
}
