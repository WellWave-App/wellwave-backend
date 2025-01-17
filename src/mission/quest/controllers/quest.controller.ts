import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { QuestService } from '../services/quest.service';

@Controller('quest')
export class QuestController {
  constructor(private readonly questService: QuestService) {}
}
