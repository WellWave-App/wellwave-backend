// update-log.dto.ts
import { IsNumber, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLogDto } from './create-log.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLogDto extends PartialType(CreateLogDto) {
  @ApiProperty({
    description: 'Updated numerical value for the log entry',
    example: 76.2,
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  VALUE?: number;
}