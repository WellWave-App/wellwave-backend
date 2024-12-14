import { Module } from '@nestjs/common';
import { RiskAssessmentService } from './service/risk_assessment.service';
import { RiskAssessmentController } from './controller/risk_assessment.controller';
import { UserEntity } from 'src/.typeorm/entities/users.entity';
import { RiskAssessmentEntity } from 'src/.typeorm/entities/assessment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([RiskAssessmentEntity, UserEntity])],
  controllers: [RiskAssessmentController],
  providers: [RiskAssessmentService],
  exports: [RiskAssessmentService],
})
export class RiskAssessmentModule {}