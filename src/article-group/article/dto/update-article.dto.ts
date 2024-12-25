import { PartialType } from '@nestjs/swagger';
import { CreateArticleDto } from './create-article.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateArticleDto extends PartialType(CreateArticleDto) {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  AID: number;
}
