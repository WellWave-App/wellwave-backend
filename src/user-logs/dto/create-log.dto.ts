// create-log.dto.ts
import { IsEnum, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { LOG_NAME } from '../../.typeorm/entities/logs.entity';

export class CreateLogDto {
  @IsNotEmpty()
  @IsNumber()
  UID: number;

  @IsNotEmpty()
  @IsEnum(LOG_NAME)
  LOG_NAME: LOG_NAME;

  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  DATE: Date;

  @IsNumber()
  VALUE: number;
}

