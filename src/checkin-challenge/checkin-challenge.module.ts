import { Module } from '@nestjs/common';
import { CheckinChallengeService } from './services/checkin-challenge.service';
import { CheckinChallengeController } from './controllers/checkin-challenge.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckInChallenge } from '../.typeorm/entities/checkin-challenge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CheckInChallenge])],
  controllers: [CheckinChallengeController],
  providers: [CheckinChallengeService],
})
export class CheckinChallengeModule {}
