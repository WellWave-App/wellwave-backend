import { Test, TestingModule } from '@nestjs/testing';
import { UserReadArticleController } from './user-read-article.controller';
import { UserReadArticleService } from '../services/user-read-article.service';

describe('UserReadArticleController', () => {
  let controller: UserReadArticleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserReadArticleController],
      providers: [UserReadArticleService],
    }).compile();

    controller = module.get<UserReadArticleController>(
      UserReadArticleController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
