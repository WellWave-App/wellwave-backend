import { PartialType } from '@nestjs/swagger';
import { AchievementBodyDTO } from './create_ach.dto';

export class UpdateAchievementBodyDTO extends PartialType(AchievementBodyDTO) {}
