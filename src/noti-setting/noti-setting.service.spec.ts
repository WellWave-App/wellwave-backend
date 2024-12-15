import { Test, TestingModule } from '@nestjs/testing';
import { NotiSettingService } from './noti-setting.service';

describe('NotiSettingService', () => {
  let service: NotiSettingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotiSettingService],
    }).compile();

    service = module.get<NotiSettingService>(NotiSettingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
