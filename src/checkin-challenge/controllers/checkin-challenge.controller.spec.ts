import { Test, TestingModule } from '@nestjs/testing';
import { CheckinChallengeController } from './checkin-challenge.controller';
import { CheckinChallengeService } from '../services/checkin-challenge.service';

describe('CheckinChallengeController', () => {
  let controller: CheckinChallengeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CheckinChallengeController],
      providers: [CheckinChallengeService],
    }).compile();

    controller = module.get<CheckinChallengeController>(
      CheckinChallengeController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
