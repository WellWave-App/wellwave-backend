import { PartialType } from '@nestjs/swagger';
import { CreateLoginStreakDto } from './create-login-streak.dto';

export class UpdateLoginStreakDto extends PartialType(CreateLoginStreakDto) {}
