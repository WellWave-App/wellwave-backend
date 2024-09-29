import { Module } from '@nestjs/common';
import { HealthAssessmentController } from './controller/health_assessment.controller';

@Module({
  imports: [],
  controllers: [HealthAssessmentController],
  providers: [HealthAssessmentController],
  exports: [HealthAssessmentController],
})
export class Health_assessment {}
