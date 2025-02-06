import { IsNotEmpty } from 'class-validator';

export class CheckInDtos {
  @IsNotEmpty()
  CHECKIN_DATE: String;
}
