import { PartialType } from '@nestjs/swagger';
import { CreateQuestDto } from './quest.dto';

export class UpdateQuestDto extends PartialType(CreateQuestDto) {}
