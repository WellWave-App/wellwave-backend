import { Injectable } from '@nestjs/common';
import { CreateUserReadArticleDto } from '../dto/create-user-read-article.dto';
import { UpdateUserReadArticleDto } from '../dto/update-user-read-article.dto';

@Injectable()
export class UserReadArticleService {
  create(createUserReadArticleDto: CreateUserReadArticleDto) {
    return 'This action adds a new userReadArticle';
  }

  findAll() {
    return `This action returns all userReadArticle`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userReadArticle`;
  }

  update(id: number, updateUserReadArticleDto: UpdateUserReadArticleDto) {
    return `This action updates a #${id} userReadArticle`;
  }

  remove(id: number) {
    return `This action removes a #${id} userReadArticle`;
  }
}
