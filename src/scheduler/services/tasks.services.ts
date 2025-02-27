import { LeaderboardService } from '@/leagues/services/leagues.service';
import { Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
export class TasksService {
  constructor(private readonly leaderboardService: LeaderboardService) {}
  private readonly BANGKOK_TIMEZONE = 'Asia/Bangkok';
  private readonly logger = new Logger(TasksService.name);

  @Cron('0 0 1,16 * *', { timeZone: 'Asia/Bangkok' }) // Run at midnight on 1st and 16th
  async handleBiMonthlyReset() {
    this.logger.debug('biMonthlyReset called every date 1, 16 of the month');
    await this.leaderboardService.biMonthlyReset();
  }

  @Cron(CronExpression.EVERY_10_MINUTES, { timeZone: 'Asia/Bangkok' })
  handleCron() {
    this.logger.debug(
      `Called EVERY_10_MINUTES ${new Date(
        new Date().toLocaleString('en-US', {
          timeZone: this.BANGKOK_TIMEZONE,
        }),
      )}`,
    );
  }
}
