import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TOPIC: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  BODY: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      // Remove all spaces and split by comma
      const cleanedString = value.replace(/[\s{}"\[\]]/g, '');
      if (!cleanedString) return [];
      return cleanedString.split(',').map((id) => Number(id));
    }
    if (Array.isArray(value)) {
      return value.map((id) => Number(id));
    }
    return [];
  })
  DISEASES_TYPE_IDS: number[];

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  ESTIMATED_READ_TIME?: number; // in minutes

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  AUTHOR?: string; // if applicable

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  THUMBNAIL_URL?: string; // for article preview

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  VIEW_COUNT?: number; // for popularity tracking

  @IsOptional({ message: 'Thumbnail image must not empty' })
  file?: any;
}
