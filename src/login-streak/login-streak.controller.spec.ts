import { Test, TestingModule } from '@nestjs/testing';
import { LoginStreakController } from './login-streak.controller';
import { LoginStreakService } from './login-streak.service';

describe('LoginStreakController', () => {
  let controller: LoginStreakController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginStreakController],
      providers: [LoginStreakService],
    }).compile();

    controller = module.get<LoginStreakController>(LoginStreakController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
