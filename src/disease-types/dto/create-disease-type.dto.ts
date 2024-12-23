import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDiseaseTypeDto {
  @IsNotEmpty()
  @IsString()
  TH_NAME: string; // 'ความดันโลหิตสูง', 'เบาหวาน', 'อ้วน', 'ไขมันในเลือดสูง'

  @IsNotEmpty()
  @IsString()
  ENG_NAME: string; // 'ความดันโลหิตสูง', 'เบาหวาน', 'อ้วน', 'ไขมันในเลือดสูง'

  @IsOptional()
  @IsString()
  DESCRIPTION?: string;
}
