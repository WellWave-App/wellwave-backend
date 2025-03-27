import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePrivacySettingsDto {
  @ApiProperty({
    description: 'Whether to show gem information to friends',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  SHOW_GEM?: boolean;

  @ApiProperty({
    description: 'Whether to show experience points to friends',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  SHOW_EXP?: boolean;

  @ApiProperty({
    description: 'Whether to show league information to friends',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  SHOW_LEAGUE?: boolean;

  @ApiProperty({
    description: 'Whether to show step count to friends',
    required: false,
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  SHOW_STEPS?: boolean;

  @ApiProperty({
    description: 'Whether to show sleep hours to friends',
    required: false,
    example: true, 
  })
  @IsBoolean()
  @IsOptional()
  SHOW_SLEEP_HOUR?: boolean;
}