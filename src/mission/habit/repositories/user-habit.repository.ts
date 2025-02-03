// import {
//   HabitStatus,
//   UserHabits,
// } from '@/.typeorm/entities/user-habits.entity';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import {
//   UpdateUserHabitDto,
//   StartHabitChallengeDto,
// } from '../dto/user-habit.dto';
// import { HabitRepository } from './habit.repository';
// import {
//   ConflictException,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { HabitCategories } from '@/.typeorm/entities/habit.entity';
// import { HabitFilterStatus } from '../interfaces/habits.interfaces';

// export class UserHabitRepository {
//   constructor(
//     @InjectRepository(UserHabits)
//     private readonly repository: Repository<UserHabits>,
//     private readonly habitRepository: HabitRepository,
//   ) {}

//   async create(dto: StartHabitChallengeDto) {
//     try {
//       const habit = await this.habitRepository.findById(dto.HID);

//       if (!habit) {
//         throw new NotFoundException('Habit not found');
//       }

//       const today = new Date();
//       const endDate = new Date(today.setDate(today.getDate() + dto.DAYS_GOAL));

//       const daily_minute_goal =
//         dto.DAILY_MINUTE_GOAL || habit.DEFAULT_DURATION_MINUTES;

//       const days_goal = dto.DAYS_GOAL || habit.DEFAULT_DAYS_GOAL;

//       const userHabit = this.repository.create({
//         ...dto,
//         START_DATE: new Date(),
//         END_DATE: endDate,
//         STATUS: HabitStatus.Active,
//         DAYS_GOAL: days_goal,
//         DAILY_MINUTE_GOAL: daily_minute_goal,
//       });

//       return this.repository.save(userHabit);
//     } catch (error) {
//       if (error.code === '23505') {
//         // Unique violation
//         throw new ConflictException('Habit with this title already exists');
//       }
//       throw new InternalServerErrorException();
//     }
//   }

//   async getUserHabitById(challengeId: number) {
//     return this.repository.findOne({
//       where: {
//         CHALLENGE_ID: challengeId,
//       },
//       relations: ['habits', 'dailyTrack'],
//       order: {
//         END_DATE: 'ASC',
//       },
//     });
//   }

//   async getUserHabits(params: {
//     uid?: number;
//     page?: number;
//     limit?: number;
//     pagination?: boolean;
//     filterHabitType?: HabitCategories;
//     filterStatus?: HabitFilterStatus;
//   }) {
//     const {
//       uid,
//       page = 1,
//       limit = 10,
//       pagination = true,
//       filterHabitType,
//       filterStatus,
//     } = params;

//     const queryBuilder = this.repository
//       .createQueryBuilder('ub')
//       .leftJoinAndSelect('ub.habits', 'habits')
//       .leftJoinAndSelect('ub.dailyTrack', 'dailyTrack');

//     queryBuilder.where('ub.UID = :uid', { uid });

//     if (filterHabitType) {
//       queryBuilder.andWhere('ub.CATEGORY. = :filterHabitType', {
//         filterHabitType,
//       });
//     }

//     if (filterStatus === HabitFilterStatus.Doing) {
//       queryBuilder.andWhere('ub.STATUS = :filterStatus', {
//         filterStatus: HabitStatus.Active,
//       });
//     }

//     if (pagination) {
//       queryBuilder.skip((page - 1) * limit).take(limit);
//     }
//     const [data, total] = await queryBuilder.getManyAndCount();

//     return { data, total };
//   }

//   async update(dto: UpdateUserHabitDto) {
//     const userHabit = await this.getUserHabitById(dto.CHALLENGE_ID);

//     if (!userHabit) {
//       throw new NotFoundException('User habit not found');
//     }

//     Object.assign(userHabit, dto);
//     return this.repository.save(userHabit);
//   }
// }
