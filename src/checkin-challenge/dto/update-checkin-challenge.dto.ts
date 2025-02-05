import { PartialType } from '@nestjs/swagger';
import { CreateCheckinChallengeDto } from './create-checkin-challenge.dto';

export class UpdateCheckinChallengeDto extends PartialType(CreateCheckinChallengeDto) {}
