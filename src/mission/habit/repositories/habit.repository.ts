// import { HabitCategories, Habits } from '@/.typeorm/entities/habit.entity';
// import {
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { QueryHabitsDto } from '../interfaces/habits.interfaces';
// import { CreateHabitDto } from '../dto/create-habit.dto';
// import { UpdateHabitDto } from '../dto/update-habit.dto';

// @Injectable()
// export class HabitRepository {
//   constructor(
//     @InjectRepository(Habits)
//     private readonly repository: Repository<Habits>,
//   ) {}

//   async findById(hid: number) {
//     const habit = await this.repository.findOne({
//       where: {
//         HID: hid,
//       },
//       order: {
//         HID: 'ASC',
//       },
//     });

//     return habit;
//   }

//   async findAll(params: {
//     page?: number;
//     limit?: number;
//     filterCategory?: HabitCategories;
//     query?: string;
//     pagination?: boolean;
//   }): Promise<{ data: Habits[]; total: number }> {
//     const {
//       page = 1,
//       limit = 10,
//       filterCategory,
//       query,
//       pagination = true,
//     } = params;

//     const queryBuilder = this.repository.createQueryBuilder('habits');

//     if (filterCategory) {
//       queryBuilder.andWhere('habits.CATEGORY = :filterCategory', {
//         filterCategory,
//       });
//     }

//     // Search by query (e.g., habit title)
//     if (params) {
//       queryBuilder.andWhere('habits.HABIT_TITLE ILIKE :query', {
//         query: `%${params}%`, // Use ILIKE for case-insensitive search
//       });
//     }

//     // Order by HID (or any other field)
//     queryBuilder.orderBy('habits.HID', 'ASC');

//     // Handle pagination
//     if (pagination) {
//       queryBuilder.skip((page - 1) * limit).take(limit);
//     }

//     // Execute query and get results
//     const [data, total] = await queryBuilder.getManyAndCount();
//     return { data, total };
//   }

//   async create(dto: CreateHabitDto): Promise<Habits> {
//     try {
//       const instance = this.repository.create(dto);
//       return await this.repository.save(instance);
//     } catch (error) {
//       if (error.code === '23505') {
//         throw new ConflictException(`name: ${dto.TITLE} with  already exists`);
//       }
//       throw new InternalServerErrorException('Failed to create quest');
//     }
//   }

//   async update(hid: number, dto: UpdateHabitDto) {
//     try {
//       await this.repository.update({ HID: hid }, dto);
//       return await this.findById(hid);
//     } catch (error) {
//       // Log or handle the error appropriately
//       console.error(error);
//       throw new Error('Failed to update the habit.');
//     }
//   }

//   async remove(hid: number): Promise<{ message: string; success: boolean }> {
//     const result = await this.repository.delete({ HID: hid });

//     if (result.affected === 0) {
//       throw new NotFoundException(`Habit with HID:${hid} not found`);
//     }

//     return {
//       message: `Habit with HID:${hid} successfully deleted`,
//       success: true,
//     };
//   }
// }
