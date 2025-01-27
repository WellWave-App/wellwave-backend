import { PartialType } from '@nestjs/swagger';
import { CreateUserQuestDto } from './create-uq.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserQuestDto extends PartialType(CreateUserQuestDto) {
  @IsNotEmpty()
  @IsNumber()
  QID: number;

  @IsNotEmpty()
  @IsNumber()
  UID: number;
}
