import { PartialType } from '@nestjs/swagger';
import { CreateDiseaseTypeDto } from './create-disease-type.dto';

export class UpdateDiseaseTypeDto extends PartialType(CreateDiseaseTypeDto) {}
