import { Test, TestingModule } from '@nestjs/testing';
import { UserReadHistoryController } from './user-read-history.controller';
import { UserReadHistoryService } from './user-read-history.service';

describe('UserReadHistoryController', () => {
  let controller: UserReadHistoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReadHistoryController],
      providers: [UserReadHistoryService],
    }).compile();

    controller = module.get<UserReadHistoryController>(UserReadHistoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
