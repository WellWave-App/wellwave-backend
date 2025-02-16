import {
  AchievementType,
  RequirementEntity,
  RequirementTrackingType,
  TrackableProperty,
} from '@/.typeorm/entities/achievement.entity';
import { LeagueType } from '@/leagues/enum/lagues.enum';
import { Expose, Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

// Helper function for handling JSON strings
const parseJSON = (value: any, defaultValue: any = {}) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value || defaultValue;
};

// Helper function for handling empty values
const handleEmpty = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// Helper function for handling numbers
const parseNumber = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export class AchievementLevelDto {
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  @Expose()
  LEVEL: number;

  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  @Expose()
  TARGET_VALUE: number;

  @IsOptional()
  @IsEnum(LeagueType)
  @Transform(({ value }) => handleEmpty(value))
  @Expose()
  TARGET_LEAGUE?: LeagueType;

  @Transform(({ value }) => {
    const parsed = parseJSON(value, { EXP: 0, GEMS: 0 });
    return {
      EXP: parseNumber(parsed.EXP) ?? 0,
      GEMS: parseNumber(parsed.GEMS) ?? 0,
    };
  })
  @Expose()
  REWARDS: {
    EXP?: number;
    GEMS?: number;
  };

  @IsOptional()
  @IsString()
  @Transform(({ value }) => handleEmpty(value))
  @Expose()
  ICON_URL?: string;
  @Expose()
  @IsOptional({ message: 'Thumbnail image must not empty' })
  file?: any;
}

export class AchievementBodyDTO {
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => handleEmpty(value))
  TITLE: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => handleEmpty(value))
  DESCRIPTION?: string;

  @IsNotEmpty()
  @IsEnum(AchievementType)
  @Transform(({ value }) => handleEmpty(value))
  ACHIEVEMENTS_TYPE: AchievementType;

  @IsNotEmpty()
  @Transform(({ value }) => {
    const parsed = parseJSON(value);
    return {
      FROM_ENTITY: handleEmpty(parsed.FROM_ENTITY),
      TRACK_PROPERTY: handleEmpty(parsed.TRACK_PROPERTY),
      TRACKING_TYPE: handleEmpty(parsed.TRACKING_TYPE),
      EXCLUDE_LEAGUE: Array.isArray(parsed.EXCLUDE_LEAGUE)
        ? parsed.EXCLUDE_LEAGUE
        : [],
      TARGET_VALUE: parseNumber(parsed.TARGET_VALUE),
      RESET_CONDITIONS: handleEmpty(parsed.RESET_CONDITIONS),
    };
  })
  REQUIREMENT: {
    FROM_ENTITY: RequirementEntity;
    TRACK_PROPERTY: TrackableProperty;
    TRACKING_TYPE: RequirementTrackingType;
    EXCLUDE_LEAGUE?: LeagueType[];
    TARGET_VALUE?: number;
    RESET_CONDITIONS?: string;
  };

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseJSON(value);
    if (!parsed) return undefined;

    return {
      START_DATE: parsed.START_DATE ? new Date(parsed.START_DATE) : undefined,
      END_DATE: parsed.END_DATE ? new Date(parsed.END_DATE) : undefined,
      // DATE: handleEmpty(parsed.DATE),
    };
  })
  TIME_CONSTRAINT?: {
    START_DATE: Date;
    END_DATE: Date;
    // DATE: string;
  };

  @IsOptional()
  @Transform(({ value }) => {
    const parsed = parseJSON(value);
    if (!parsed) return undefined;

    return {
      REQUIRED_ACHIEVEMENTS: Array.isArray(parsed.REQUIRED_ACHIEVEMENTS)
        ? parsed.REQUIRED_ACHIEVEMENTS
        : [],
      REQUIRED_MISSIONS: parseNumber(parsed.REQUIRED_MISSIONS),
    };
  })
  PREREQUISITES?: {
    REQUIRED_ACHIEVEMENTS?: string[];
    REQUIRED_MISSIONS?: number;
  };

  @IsNotEmpty()
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => AchievementLevelDto)
  @Transform(({ value }) => {
    const parsed = parseJSON(value, []);
    return Array.isArray(parsed) ? parsed : [];
  })
  levels: AchievementLevelDto[];
}
