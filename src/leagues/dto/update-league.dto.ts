import { PartialType } from '@nestjs/swagger';
import { CreateUserLeagderboardDto } from './create-league.dto';

export class UpdateLeagueDto extends PartialType(CreateUserLeagderboardDto) {}
