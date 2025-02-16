import { IsNotEmpty, IsOptional } from 'class-validator';

export class query {
  @IsNotEmpty()
  userId?: number;
  @IsOptional()
  page?: number;
  @IsOptional()
  limit?: number;
  @IsOptional()
  title?: string;
}
