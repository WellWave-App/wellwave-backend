import { Injectable } from '@nestjs/common';
import { CreateUserReadHistoryDto } from '../dto/create-user-read-history.dto';
import { UpdateUserReadHistoryDto } from '../dto/update-user-read-history.dto';

@Injectable()
export class UserReadHistoryService {
  create(createUserReadHistoryDto: CreateUserReadHistoryDto) {
    return 'This action adds a new userReadHistory';
  }

  findAll() {
    return `This action returns all userReadHistory`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userReadHistory`;
  }

  update(id: number, updateUserReadHistoryDto: UpdateUserReadHistoryDto) {
    return `This action updates a #${id} userReadHistory`;
  }

  remove(id: number) {
    return `This action removes a #${id} userReadHistory`;
  }
}
