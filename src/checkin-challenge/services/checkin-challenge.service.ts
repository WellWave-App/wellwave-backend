import { Injectable } from '@nestjs/common';
import { CreateCheckinChallengeDto } from '../dto/create-checkin-challenge.dto';
import { UpdateCheckinChallengeDto } from '../dto/update-checkin-challenge.dto';

@Injectable()
export class CheckinChallengeService {
  create(createCheckinChallengeDto: CreateCheckinChallengeDto) {
    return 'This action adds a new checkinChallenge';
  }

  findAll() {
    return `This action returns all checkinChallenge`;
  }

  findOne(id: number) {
    return `This action returns a #${id} checkinChallenge`;
  }

  update(id: number, updateCheckinChallengeDto: UpdateCheckinChallengeDto) {
    return `This action updates a #${id} checkinChallenge`;
  }

  remove(id: number) {
    return `This action removes a #${id} checkinChallenge`;
  }
}
