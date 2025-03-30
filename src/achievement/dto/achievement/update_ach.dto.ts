import { PartialType } from '@nestjs/swagger';
import { AchievementBodyDTO, AchievementLevelDto } from './create_ach.dto';
import { IsArray, IsOptional } from 'class-validator';
import { Transform, Type } from 'class-transformer';

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

export class UpdateAchievementBodyDTO extends PartialType(AchievementBodyDTO) {
  @IsOptional()
  @IsArray()
  // @ValidateNested({ each: true })
  @Type(() => AchievementLevelDto)
  @Transform(({ value }) => {
    const parsed = parseJSON(value, []);
    return Array.isArray(parsed) ? parsed : [];
  })
  levels: AchievementLevelDto[];
}
