import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../../.typeorm/entities/users.entity';
import { RegisterUserDto } from '../dto/register.dto';
import { AuthService } from 'src/auth/services/auth.service';
import { LoginStreakService } from '@/login-streak/services/login-streak.service';
import { LogsService } from '@/user-logs/services/logs.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private loginStreakService: LoginStreakService,
    private logsService: LogsService,
  ) {}

  async create(registerUserDto: RegisterUserDto): Promise<UserEntity> {
    const user = this.usersRepository.create({
      ...registerUserDto,
      // createAt: new Date(),
    });

    return await this.usersRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({
      where: { EMAIL: email },
    });
    return user || null;
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ USERS: UserEntity[]; total: number }> {
    const [users, total] = await this.usersRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      // relations: ['logs']
    });
    return { USERS: users, total };
  }

  async findOne(uid: number): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { UID: uid } });
    if (!user) {
      throw new NotFoundException(`User with ID ${uid} not found`);
    }
    return user;
  }

  async update(uid: number, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const user = await this.findOne(uid);
    Object.assign(user, updateUserDto);
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
    const user = await this.findOne(uid);

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
