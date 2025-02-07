import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateRiskAssessmentDto {
  @IsOptional()
  @IsNumber()
  DIASTOLIC_BLOOD_PRESSURE?: number;

  @IsOptional()
  @IsNumber()
  SYSTOLIC_BLOOD_PRESSURE?: number;

  @IsOptional()
  @IsNumber()
  HDL?: number;

  @IsOptional()
  @IsNumber()
  LDL?: number;

  @IsOptional()
  @IsNumber()
  WAIST_LINE?: number;

  @IsOptional()
  @IsBoolean()
  HAS_SMOKE?: boolean;

  @IsOptional()
  @IsBoolean()
  HAS_DRINK?: boolean;

  @IsOptional()
  @IsNumber()
  HYPERTENSION?: number;

  @IsOptional()
  @IsNumber()
  DIABETES?: number;

  @IsOptional()
  @IsNumber()
  DYSLIPIDEMIA?: number;

  @IsOptional()
  @IsNumber()
  OBESITY?: number;
}
