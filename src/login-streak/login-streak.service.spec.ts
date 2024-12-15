import { Test, TestingModule } from '@nestjs/testing';
import { LoginStreakService } from './login-streak.service';

describe('LoginStreakService', () => {
  let service: LoginStreakService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoginStreakService],
    }).compile();

    service = module.get<LoginStreakService>(LoginStreakService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
