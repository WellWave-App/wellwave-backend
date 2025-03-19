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
import { FriendService } from './friend.service';
import { CreateFriendDto } from './dto/create-friend.dto';
import { UpdateFriendDto } from './dto/update-friend.dto';
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
  @Post('/add/:uid')
  add(@Req() req, @Param('uid') uid: number) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.add(+fromId, +toId);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post('/search/:uid')
  search(@Req() req, @Param('uid') uid: number) {
    return this.friendService.search(uid);
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post('/unfriend/:uid')
  unfriend(@Req() req, @Param('uid') uid: number) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.unfriend(+fromId, +toId);
  }

  @Get('/user-friend/:uid')
  getUserFriends(@Param('uid') uid: number) {
    return this.friendService.getUserFriends(uid);
  }

  @Get('/friend-profile/:uid')
  getFriendProfle(@Param('uid') uid: number) {
    return this.friendService.getFriendProfle(uid);
  }

  @Post('/send-noti/:uid')
  sendNoti(
    @Req() req,
    @Param('uid') uid: number,
    @Body()
    body: {
      message: string;
    },
  ) {
    const fromId = req.user.UID;
    const toId = uid;
    return this.friendService.sendNoti(+fromId, +toId, body.message);
  }

  @Patch('privacy/:userId')
  async updateUserPrivacySettings(
    @Param('userId') userId: number,
    @Body() updateDto: UpdatePrivacySettingsDto,
  ): Promise<PrivateSetting> {
    return this.friendService.updatePrivacySettings(+userId, updateDto);
  }

  @Get('privacy/:userId')
  async getUserPrivacySettings(
    @Param('userId') userId: number,
  ): Promise<PrivateSetting> {
    return this.friendService.getPrivacySettings(userId);
  }
}
