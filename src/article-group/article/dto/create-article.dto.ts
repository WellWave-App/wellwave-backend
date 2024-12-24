import { Transform, TransformFnParams } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TOPIC: string;

  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  BODY: string;

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

  @IsOptional()
  @IsArray() // Ensure it's an array
  @IsNumber({}, { each: true }) // Ensure each item in the array is a number
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      return value.split(',').map((id) => parseInt(id, 10)); // Transform comma-separated string into array of numbers
    }
    return value;
  })
  DISEASES_TYPE_IDS?: number[]; // for categorization

  @IsOptional()
  imgFile?: any;
}
