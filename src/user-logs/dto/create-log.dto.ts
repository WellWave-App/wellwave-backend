// create-log.dto.ts
import { IsEnum, IsNumber, IsDate, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { LOG_NAME } from '../../.typeorm/entities/logs.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLogDto {
  @ApiProperty({
    description: 'User ID',
    example: 1,
    type: Number,
  })
  @IsNotEmpty()
  @IsNumber()
  UID: number;

  @ApiProperty({
    description: 'Type of log entry',
    enum: LOG_NAME,
    example: LOG_NAME.WEIGHT_LOG,
    enumName: 'LOG_NAME',
  })
  @IsNotEmpty()
  @IsEnum(LOG_NAME)
  LOG_NAME: LOG_NAME;

  @ApiProperty({
    description: 'Date of the log entry',
    example: '2024-12-22',
    type: Date,
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  DATE: Date;

  @ApiProperty({
    description: 'Numerical value for the log entry',
    example: 75.5,
    type: Number,
  })
  @IsNumber()
  VALUE: number;
}