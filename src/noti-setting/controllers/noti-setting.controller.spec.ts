import { Test, TestingModule } from '@nestjs/testing';
import { NotiSettingController } from './noti-setting.controller';
import { NotiSettingService } from './noti-setting.service';

describe('NotiSettingController', () => {
  let controller: NotiSettingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotiSettingController],
      providers: [NotiSettingService],
    }).compile();

    controller = module.get<NotiSettingController>(NotiSettingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
