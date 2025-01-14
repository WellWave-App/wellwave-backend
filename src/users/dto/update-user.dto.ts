import { Transform, TransformFnParams } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';
import {
  IsString,
  IsEmail,
  IsBoolean,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  USERNAME?: string;

  @IsEmail()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  EMAIL?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.GOOGLE_ID) // Only validate PASSWORD if GOOGLE_ID is not provided
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  PASSWORD?: string;

  @IsOptional()
  @IsString()
  @ValidateIf((o) => !o.PASSWORD) // Only validate GOOGLE_ID if PASSWORD is not provided
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  GOOGLE_ID?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  YEAR_OF_BIRTH?: number;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === '') return undefined;
    return value === 'true' || value === true;
  })
  GENDER?: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  HEIGHT?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  WEIGHT?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  GEM?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  EXP?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  USER_GOAL?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  USER_GOAL_STEP_WEEK?: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  USER_GOAL_EX_TIME_WEEK?: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  IMAGE_URL?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  REMINDER_NOTI_TIME?: string;

  @IsOptional()
  imgFile?: any;
}
