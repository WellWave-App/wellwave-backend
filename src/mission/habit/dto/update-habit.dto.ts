import { IsNotEmpty, IsNumber } from 'class-validator';
import { CreateHabitDto } from './create-habit.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateHabitDto extends PartialType(CreateHabitDto) {
  @IsNotEmpty()
  @IsNumber()
  HID: number;
}
