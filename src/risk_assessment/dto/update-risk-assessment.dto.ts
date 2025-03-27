import { CreateRiskAssessmentDto } from './create-risk-assessment.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateRiskAssessmentDto extends CreateRiskAssessmentDto {}

export class PartialUpdateRiskAssessmentDto extends PartialType(UpdateRiskAssessmentDto) {}
