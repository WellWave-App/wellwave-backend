import { Test, TestingModule } from '@nestjs/testing';
import { UserReadArticleService } from './user-read-article.service';

describe('UserReadArticleService', () => {
  let service: UserReadArticleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserReadArticleService],
    }).compile();

    service = module.get<UserReadArticleService>(UserReadArticleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
