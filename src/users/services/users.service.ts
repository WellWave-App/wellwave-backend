import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../../.typeorm/entities/users.entity';
import { RegisterUserDto } from '../dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
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
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Ensure EXP and GEM never go below 0
    const updatedUser = {
      ...user,
      ...updateUserDto,
      EXP: Math.max(0, updateUserDto.EXP),
      GEM: Math.max(0, updateUserDto.GEM),
    };

    return await this.usersRepository.save(updatedUser);
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
}
