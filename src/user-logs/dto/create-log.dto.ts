import { IsEnum, IsNumber, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { LogType } from '../../typeorm/entities/log.entity';

export class CreateLogDto {
  @IsDate()
  @Type(() => Date)
  date: Date;

  @IsNumber()
  value: number;

  @IsEnum(LogType)
  type: LogType;

  @IsNumber()
  userId: number;
}
