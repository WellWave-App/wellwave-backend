// dto/user-stats-filter.dto.ts
export class UserStatsFilterDto {
  @ApiProperty({
    enum: HabitCategories,
    required: false,
    description: 'Filter by habit category',
  })
  @IsEnum(HabitCategories)
  @IsOptional()
  habitCategory?: HabitCategories;

  @ApiProperty({
    required: false,
    description: 'Search by user name',
  })
  @IsString()
  @IsOptional()
  search?: string;
}

export class PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}

import { HabitCategories } from '@/.typeorm/entities/habit.entity';
// dto/user-stats-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNumber, Min } from 'class-validator';

class UserCompletedAmount {
  @ApiProperty()
  completed: number;

  @ApiProperty()
  total: number;
}

class HabitCategoriesDistribution {
  @ApiProperty()
  'ออกกำลังกาย': number;

  @ApiProperty()
  'รับประทานอาหาร': number;

  @ApiProperty()
  'พักผ่อน': number;
}

class Rewards {
  @ApiProperty()
  exp: number;

  @ApiProperty()
  gems: number;
}

class UserStats {
  @ApiProperty()
  name: string;

  @ApiProperty()
  image_url: string;

  @ApiProperty({ type: HabitCategoriesDistribution })
  habitCategories: HabitCategoriesDistribution;

  @ApiProperty({ type: Rewards })
  reward: Rewards;

  @ApiProperty()
  complete_rate: number;

  @ApiProperty({ type: UserCompletedAmount })
  user_completed_amount: UserCompletedAmount;

  @ApiProperty()
  mood_feedback: string;

  @ApiProperty({ enum: ['เควส', 'ภารกิจปรับนิสัย', 'ภารกิจประจำวัน'] })
  type: string;
}

class PaginationMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class UserStatsResponseDto {
  @ApiProperty({ type: [UserStats] })
  data: UserStats[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
