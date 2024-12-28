import { Test, TestingModule } from '@nestjs/testing';
import { UserReadHistoryService } from './user-read-history.service';

describe('UserReadHistoryService', () => {
  let service: UserReadHistoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserReadHistoryService],
    }).compile();

    service = module.get<UserReadHistoryService>(UserReadHistoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
