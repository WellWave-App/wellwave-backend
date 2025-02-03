import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class TrackQuestDto {
  @IsNumber()
  @IsNotEmpty()
  QID: number;

  @IsNumber()
  @IsNotEmpty()
  value: number;

  // @IsString()
  // @IsOptional()
  // notes?: string;
}

