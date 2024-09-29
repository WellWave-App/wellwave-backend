import { IsEnum, IsNumber, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { LOG_NAME } from '../../.typeorm/entities/logs.entity';

export class CreateLogDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  DATE?: Date;

  @IsNumber()
  VALUE: number;

  @IsEnum(LOG_NAME)
  LOG_NAME: LOG_NAME;

  @IsNumber()
  UID: number;
}
