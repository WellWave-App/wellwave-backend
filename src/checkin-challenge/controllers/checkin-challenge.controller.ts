import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CheckinChallengeService } from '../services/checkin-challenge.service';
import { CreateCheckinChallengeDto } from '../dto/create-checkin-challenge.dto';
import { UpdateCheckinChallengeDto } from '../dto/update-checkin-challenge.dto';

@Controller('checkin-challenge')
export class CheckinChallengeController {
  constructor(
    private readonly checkinChallengeService: CheckinChallengeService,
  ) {}

  @Post('/checkin/:uid')
  updateCheckin(@Body() body: { CHECKIN_DATE: string }) {
    
  }

  @Post()
  create(@Body() createCheckinChallengeDto: CreateCheckinChallengeDto) {
    return this.checkinChallengeService.create(createCheckinChallengeDto);
  }

  @Get()
  findAll() {
    return this.checkinChallengeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkinChallengeService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCheckinChallengeDto: UpdateCheckinChallengeDto,
  ) {
    return this.checkinChallengeService.update(+id, updateCheckinChallengeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.checkinChallengeService.remove(+id);
  }
}
