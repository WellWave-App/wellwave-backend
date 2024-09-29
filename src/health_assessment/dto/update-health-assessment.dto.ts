import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthAssessmentDto } from './create-health-assessment.dto';

export class UpdateHealthAssessmentDto extends PartialType(CreateHealthAssessmentDto) {
  name: string;
  age: number;
}
