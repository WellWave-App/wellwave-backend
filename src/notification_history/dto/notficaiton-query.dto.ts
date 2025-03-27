import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

// Helper function for handling empty values
const handleEmpty = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// Helper function for handling numbers
const parseNumber = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export class NotificationQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  page?: number;

  @ApiProperty({ required: false, default: 7 })
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  limit?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => parseNumber(value))
  IS_READ?: boolean;
}
