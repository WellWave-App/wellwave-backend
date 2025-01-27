import { PartialType } from '@nestjs/swagger';
import { CreateQuestDto } from './create-quest.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Transform, TransformFnParams } from 'class-transformer';

export class UpdateQuesDto extends PartialType(CreateQuestDto) {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  QID: number;
}
