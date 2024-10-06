import { IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateLogDto } from './create-log.dto';

export class UpdateLogDto extends PartialType(CreateLogDto) {
  @IsOptional()
  @IsNumber()
  VALUE?: number;
}