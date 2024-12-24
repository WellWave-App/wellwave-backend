import { PartialType } from '@nestjs/swagger';
import { CreateUserReadHistoryDto } from './create-user-read-history.dto';

export class UpdateUserReadHistoryDto extends PartialType(CreateUserReadHistoryDto) {}
