import { Test, TestingModule } from '@nestjs/testing';
import { HealthAssessmentController } from './health_assessment.controller';
import { HealthAssessmentService } from '../service/health_assessment.service';

describe('HealthAssessmentController', () => {
  let controller: HealthAssessmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthAssessmentController],
      providers: [HealthAssessmentService],
    }).compile();

    controller = module.get<HealthAssessmentController>(HealthAssessmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
