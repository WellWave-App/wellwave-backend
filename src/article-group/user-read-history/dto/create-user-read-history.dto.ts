import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserReadHistoryDto {
  @IsNotEmpty()
  @IsNumber()
  UID: number; // PK [ref: > USERS.UID]

  @IsNotEmpty()
  @IsNumber()
  AID: number; // PK [ref: > ARTICLE.AID]

  @IsOptional()
  @IsBoolean()
  IS_READ: boolean;

  @IsOptional()
  @IsBoolean()
  IS_BOOKMARK: boolean;

  // READING_PROGRESS: number; // percentage of article read
  @IsOptional()
  @IsNumber()
  RATING: number; // optional: user rating

  @IsOptional()
  FIRST_READ_DATE: Date; // track when they read it

  @IsOptional()
  LASTED_READ_DATE: Date; // track when they read it

  // READ_DATE: Date; // track when they read it
}
