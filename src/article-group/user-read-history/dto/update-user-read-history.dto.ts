import { PartialType } from '@nestjs/swagger';
import { CreateUserReadHistoryDto } from './create-user-read-history.dto';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateUserReadHistoryDto extends PartialType(
  CreateUserReadHistoryDto,
) {
  @IsNotEmpty()
  @IsNumber()
  UID: number; // PK [ref: > USERS.UID]

  @IsNotEmpty()
  @IsNumber()
  AID: number; // PK [ref: > ARTICLE.AID]
}
