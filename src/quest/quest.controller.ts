import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
  ParseIntPipe,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuestService } from './quest.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateQuestDto, JoinQuestDto, QuestFilterType } from './dto/quest.dto';
import { UpdateQuestDto } from './dto/update-quest.dto';

@Controller('quests')
@UseGuards(JwtAuthGuard)
export class QuestController {
  constructor(private readonly questService: QuestService) {}

  @Get('/:userId/active')
  getUserActiveQuest(@Param('userId', ParseIntPipe) userId: number) {
    return this.questService.getUserActiveQuests(userId);
  }

  @Get('/:userId/available')
  getAvailableQuests(
    @Param('userId') userId: number,
    @Query('filter')
    filterType: QuestFilterType = QuestFilterType.ALL,
  ) {
    return this.questService.getAvailableQuests(userId, filterType);
  }
  
  @Get()
  getAllQuests() {
    return this.questService.getAllQuests();
  }

  @Post()
  // @UseGuards(AdminGuard) // Assuming you have an admin guard
  createQuest(@Body() createQuestDto: CreateQuestDto) {
    return this.questService.createQuest(createQuestDto);
  }

  @Patch('/:id')
  // @UseGuards(AdminGuard)
  updateQuest(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuestDto: UpdateQuestDto,
  ) {
    return this.questService.updateQuest(id, updateQuestDto);
  }

  @Delete('/:id')
  // @UseGuards(AdminGuard)
  deleteQuest(@Param('id', ParseIntPipe) id: number) {
    return this.questService.deleteQuest(id);
  }

  @Get('/:userId/:questId')
  async getSpecificQuest(
    @Param('userId') userId: number,
    @Param('questId') questId: number,
  ) {
    return this.questService.getSpecificUserQuest(userId, questId);
  }


  @Get('/:userId')
  getUserQuests(@Param('userId') userId: number) {
    return this.questService.getUserQuests(userId);
  }

  @Post('/join')
  joinQuest(@Body() joinQuestDto: JoinQuestDto) {
    return this.questService.joinQuest(joinQuestDto);
  }
}
