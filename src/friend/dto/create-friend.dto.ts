import { User } from '@/.typeorm/entities/users.entity';
import { IsNotEmpty } from 'class-validator';
export class CreateFriendDto {
  @IsNotEmpty()
  USER1_ID: number;
  @IsNotEmpty()
  USER2_ID: number;
  @IsNotEmpty()
  REQUESTED_BY_ID: number;
}
