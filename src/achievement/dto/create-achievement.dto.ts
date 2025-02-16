import { Transform, TransformFnParams } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AchievementType, RequirementTrackingType } from '@/.typeorm/entities/achievement.entity';

class RequirementDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  FROM_ENTITY: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TRACK_PROPERTY: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TRACKING_TYPE: RequirementTrackingType;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  RESET_CONDITIONS?: string;
}

class TimeConstraintDto {
  @IsDateString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  START_DATE: Date;

  @IsDateString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  END_DATE: Date;

  @IsString()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  DATE: string;
}

class PrerequisitesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      const cleanedString = value.replace(/[\s{}"\[\]]/g, '');
      if (!cleanedString) return [];
      return cleanedString.split(',');
    }
    return value;
  })
  REQUIRED_ACHIEVEMENTS?: string[];

  @IsNumber()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  REQUIRED_MISSIONS?: number;
}

class AchievementLevelDto {
  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  LEVEL: number;

  @IsNumber()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : Number(value),
  )
  TARGET_VALUE: number;

  @IsObject()
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  REWARDS: {
    EXP?: number;
    GEMS?: number;
  };
}

export class CreateAchievementDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  TITLE: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  DESCRIPTION: string;

  @IsEnum(AchievementType)
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  ACHIEVEMENTS_TYPE: AchievementType;

  @IsObject()
  @ValidateNested()
  @Type(() => RequirementDto)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  REQUIREMENT: RequirementDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TimeConstraintDto)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  TIME_CONSTRAINT?: TimeConstraintDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PrerequisitesDto)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return value;
  })
  PREREQUISITES?: PrerequisitesDto;

  @IsString()
  @IsOptional()
  @Transform(({ value }: TransformFnParams) =>
    value === '' ? undefined : value,
  )
  ICON_URL?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AchievementLevelDto)
  @Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  levels: AchievementLevelDto[];

  @IsOptional()
  file?: any;
}
