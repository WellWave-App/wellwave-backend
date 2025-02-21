import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateUserLeagderboardDto } from '../dto/create-league.dto';
import { UpdateLeagueDto } from '../dto/update-league.dto';
import { LeaderboardService } from '../services/leagues.service';
import { Roles } from '@/auth/roles/roles.decorator';
import { Role } from '@/auth/roles/roles.enum';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { RoleGuard } from '@/auth/guard/role.guard';
import { LeagueType } from '../enum/lagues.enum';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaguesService: LeaderboardService) {}

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Get('/reset')
  reset() {
    return this.leaguesService.biMonthlyReset();
  }

  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  @Post()
  create(@Body() dto: CreateUserLeagderboardDto) {
    return this.leaguesService.create(null, dto);
  }

  @Get('/:league/:groupId/')
  getLeagueBoard(
    @Param('league') league: LeagueType,
    @Param('groupId') groupId: number,
  ) {
    return this.leaguesService.getGroupMembers(league, groupId);
  }
}
