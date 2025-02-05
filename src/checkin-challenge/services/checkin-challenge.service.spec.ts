import { Test, TestingModule } from '@nestjs/testing';
import { CheckinChallengeService } from './checkin-challenge.service';

describe('CheckinChallengeService', () => {
  let service: CheckinChallengeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CheckinChallengeService],
    }).compile();

    service = module.get<CheckinChallengeService>(CheckinChallengeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
