import { Test, TestingModule } from '@nestjs/testing';
import { HabitRepository } from '../repositories/habit.repository';

describe('HabitService', () => {
  let service: HabitRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HabitRepository],
    }).compile();

    service = module.get<HabitRepository>(HabitRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
