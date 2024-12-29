import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserReadHistoryDto } from '../dto/create-user-read-history.dto';
import { UpdateUserReadHistoryDto } from '../dto/update-user-read-history.dto';
import { UserReadHistoryReposity } from '../repositories/user-read-histort.repository';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { UsersService } from '@/users/services/users.service';
import { ArticleService } from '@/article-group/article/services/article.service';

@Injectable()
export class UserReadHistoryService {
  constructor(
    private readonly repository: UserReadHistoryReposity,
    private readonly usersService: UsersService,
    private readonly articleService: ArticleService,
  ) {}

  async create(dto: CreateUserReadHistoryDto): Promise<UserReadHistory> {
    try {
      const exist = await this.repository.findById(dto.UID, dto.AID);
      if (exist) {
        throw new ConflictException(
          `this history already exists, may use update or enter-read`,
        );
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        return this.repository.create(dto);
      } else {
        throw error;
      }
    }
  }

  findAll(
    uid: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserReadHistory>> {
    return this.repository.findAll(uid, page, limit);
  }

  findOne(uid: number, aid: number): Promise<UserReadHistory> {
    return this.repository.findById(uid, aid);
  }

  update(dto: UpdateUserReadHistoryDto): Promise<UserReadHistory> {
    dto.LASTED_READ_DATE = new Date();
    return this.repository.update(dto);
  }

  remove(uid: number, aid: number) {
    return this.repository.remove(uid, aid);
  }

  async getBookmarkedArticles(uid: number) {
    try {
      const user = await this.usersService.findOne(uid);
      if (!user) {
        throw new NotFoundException(`User not with UID${uid} found`);
      }
      return this.repository.findBookmarkedArticles(uid);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user bookmarks');
    }
  }

  updateBookmark(
    uid: number,
    aid: number,
    is_bookmark: boolean,
  ): Promise<UserReadHistory> {
    return this.repository.update({
      UID: uid,
      AID: aid,
      IS_BOOKMARK: is_bookmark,
    });
  }

  async enterRead(dto: CreateUserReadHistoryDto): Promise<UserReadHistory> {
    try {
      const exist = await this.repository.findById(dto.UID, dto.AID);

      if (exist) {
        return await this.update(dto);
      }

      throw new NotFoundException();
    } catch (error) {
      if (error instanceof NotFoundException) {
        return await this.create(dto);
      }

      throw error;
    }
  }
}
