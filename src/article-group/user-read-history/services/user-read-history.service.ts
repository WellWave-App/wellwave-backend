import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserReadHistoryDto } from '../dto/create-user-read-history.dto';
import { UpdateUserReadHistoryDto } from '../dto/update-user-read-history.dto';
import { UserReadHistoryReposity } from '../repositories/user-read-history.repository';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';
import { PaginatedResponse } from '@/response/response.interface';
import { UsersService } from '@/users/services/users.service';
import { ArticleService } from '@/article-group/article/services/article.service';
import { DateService } from '@/helpers/date/date.services';

@Injectable()
export class UserReadHistoryService {
  constructor(
    private readonly repository: UserReadHistoryReposity,
    private readonly usersService: UsersService,
    private readonly dateService: DateService,
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
    dto.LASTED_READ_DATE = new Date(
      this.dateService.getCurrentDate().timestamp,
    );
    return this.repository.update(dto);
  }

  remove(uid: number, aid: number) {
    return this.repository.remove(uid, aid);
  }

  async getBookmarkedArticles(uid: number) {
    try {
      const user = await this.usersService.getById(uid);
      if (!user) {
        throw new NotFoundException(`User not with UID${uid} found`);
      }
      return this.repository.findBookmarkedArticles(uid);
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch user bookmarks');
    }
  }

  async updateBookmark(
    dto: CreateUserReadHistoryDto,
  ): Promise<UserReadHistory> {
    try {
      const exist = await this.repository.findById(dto.UID, dto.AID);

      if (exist) {
        return this.repository.update({
          UID: dto.UID,
          AID: dto.AID,
          IS_BOOKMARK: dto.IS_BOOKMARK,
        });
      }

      throw new NotFoundException();
    } catch (error) {
      if (error instanceof NotFoundException) {
        return await this.create(dto);
      }
      throw error;
    }
  }

  async enterRead(dto: CreateUserReadHistoryDto): Promise<UserReadHistory> {
    try {
      const exist = await this.repository.findById(dto.UID, dto.AID);

      if (exist) {
        if( exist.FIRST_READ_DATE === null) {
          
        }
        return await this.update(dto);
      }

      throw new NotFoundException();
    } catch (error) {
      if (error instanceof NotFoundException) {
        dto.FIRST_READ_DATE = new Date(
          this.dateService.getCurrentDate().timestamp,
        );
        return await this.create(dto);
      }

      throw error;
    }
  }
}
