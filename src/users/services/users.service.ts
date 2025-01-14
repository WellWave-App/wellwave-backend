import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../../.typeorm/entities/users.entity';
import { RegisterUserDto } from '../dto/register.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { LoginStreakService } from '@/login-streak/services/login-streak.service';
// import { LogsService } from '@/user-logs/services/logs.service';
import { ImageService } from '@/image/image.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserReadHistoryService } from '@/article-group/user-read-history/services/user-read-history.service';
import { UserReadHistory } from '@/.typeorm/entities/user-read-history.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly loginStreakService: LoginStreakService,
    private readonly imageService: ImageService,
    @InjectRepository(UserReadHistory)
    private userReadHistoryRepository: Repository<UserReadHistory>,

    // private logsService: LogsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const exist = await this.usersRepository.findOne({
      where: { EMAIL: createUserDto.EMAIL },
    });

    if (exist) {
      throw new ConflictException('This Email has been used');
    }

    const user = this.usersRepository.create();

    if (createUserDto.PASSWORD) {
      user.setPassword(createUserDto.PASSWORD);
      const { PASSWORD, ...otherField } = createUserDto;
      Object.assign(user, otherField);
    } else {
      Object.assign(user, createUserDto);
    }

    return await this.usersRepository.save(user);
  }

  async getByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { EMAIL: email },
    });
    return user || null;
  }

  async getAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ USERS: User[]; total: number }> {
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // Validate that pageNum and limitNum are numbers and not less than 1
    const validatedPage = isNaN(pageNum) || pageNum < 1 ? 1 : pageNum;
    const validatedLimit = isNaN(limitNum) || limitNum < 1 ? 10 : limitNum;

    const [users, total] = await this.usersRepository.findAndCount({
      skip: (validatedPage - 1) * validatedLimit,
      take: validatedLimit,
      // relations: ['logs']
      order: { createAt: 'ASC' },
    });

    return { USERS: users, total };
  }

  async getById(uid: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }
    return user;
  }

  async update(
    uid: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.getById(uid);

    if (file) {
      const filename = file.filename;
      updateUserDto.IMAGE_URL = this.imageService.getImageUrl(filename);
    }

    // Clean up the DTO by removing any undefined values
    const cleanedDto: UpdateUserDto = Object.entries(updateUserDto).reduce(
      (acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    // Handle password separately
    if ('PASSWORD' in cleanedDto) {
      user.setPassword(cleanedDto.PASSWORD);
      delete cleanedDto.PASSWORD; // Remove from cleanedDto to prevent double-handling
    }

    // Update other fields
    Object.assign(user, cleanedDto);

    return await this.usersRepository.save(user);
  }

  async remove(uid: number): Promise<{ message: string; success: boolean }> {
    const result = await this.usersRepository.delete(uid);

    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }

    return {
      message: `User with UID ${uid} successfully deleted`,
      success: true,
    };
  }

  async getProfile(uid: number) {
    //userInfo
    const user = await this.getById(uid);

    if (!user) {
      throw new NotFoundException('user not found, please re-login');
    }

    // loginStats
    // get week start date end date
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    const daysToMonday = (dayOfWeek + 6) % 7; // Convert Sunday (0) to 6, Monday (1) to 0, etc.
    start.setDate(today.getDate() - daysToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Add 6 days to get to Sunday

    const loginStats = await this.loginStreakService.getUserLoginHistoryStats(
      uid,
      start,
      end,
    );

    // acheivement
    // let mock first cuz didnt have this features yet!
    const mockAcheivements = [
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
      {
        imgPath: '',
        achTitle: '',
        dateAcheived: '',
      },
    ];

    // log

    return {
      userInfo: user,
      userLeague: {
        LB_ID: 2,
        LEAGUE_NAME: 'Silver',
        MIN_EXP: 1000,
        MAX_EXP: 2499,
      },
      loginStats: loginStats,
      usersAchievement: mockAcheivements,
    };
  }
}
