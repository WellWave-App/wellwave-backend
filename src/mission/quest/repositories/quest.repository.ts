// import { Quest } from '@/.typeorm/entities/quest.entity';
// import { CreateQuestDto } from '@/mission/quest/dtos/create-quest.dto';
// import {
//   ConflictException,
//   Injectable,
//   InternalServerErrorException,
//   NotFoundException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { PaginatedResponse } from '../../../response/response.interface';
// import { UpdateQuesDto } from '@/mission/quest/dtos/update-quest.dto';
// import { QuestStatus } from '@/.typeorm/entities/user-quests.entity';
// import { QuestParams } from '../interfaces/quests.interfaces';

// @Injectable()
// export class QuestRepository {
//   constructor(
//     @InjectRepository(Quest)
//     private readonly repository: Repository<Quest>,
//   ) {}

//   async findById(QID: number): Promise<Quest | null> {
//     return await this.repository.findOne({ where: { QID } });
//   }

//   async findByIdOrFail(QID: number): Promise<Quest> {
//     const quest = await this.findById(QID);
//     if (!quest) throw new NotFoundException(`QID: ${QID} not found`);
//     return quest;
//   }

//   async create(create: CreateQuestDto): Promise<Quest> {
//     try {
//       const instance = this.repository.create(create);
//       return await this.repository.save(instance);
//     } catch (error) {
//       if (error.code === '23505') {
//         throw new ConflictException('Quest already exists');
//       }
//       throw new InternalServerErrorException('Failed to create quest');
//     }
//   }

//   async findAll(
//     params: QuestParams & { pagination?: boolean },
//   ): Promise<{ data: Quest[]; total: number }> {
//     const { query, page = 1, limit = 10, categoryId, pagination } = params;

//     const queryBuilder = this.repository
//       .createQueryBuilder('quest')
//       .leftJoinAndSelect('quest.category', 'category');

//     if (categoryId) {
//       queryBuilder.andWhere('quest.CATEGORY_ID IN :categoryId', { categoryId });
//     }

//     if (query) {
//       queryBuilder.andWhere('quest.TITLE LIKE :query', { search: `${query}` });
//     }

//     if (!pagination) {
//       const [data, total] = await queryBuilder
//         .orderBy({
//           'quest.TITLE': 'ASC',
//         })
//         .getManyAndCount();

//       return {
//         data,
//         total,
//       };
//     }

//     // const totalItems = await queryBuilder.getCount();

//     queryBuilder
//       .skip((page - 1) * limit)
//       .take(limit)
//       .orderBy({
//         'quest.TITLE': 'ASC',
//       });

//     const [data, total] = await queryBuilder.getManyAndCount();

//     return {
//       data,
//       total,
//     };
//   }

//   async update(update: UpdateQuesDto): Promise<Quest> {
//     const quest = await this.findById(update.QID);

//     if (!quest) {
//       throw new NotFoundException(`Quest with QID: ${update.QID} not exists`);
//     }

//     try {
//       Object.assign(quest, update);
//       return await this.repository.save(quest);
//     } catch (error) {
//       // if (error.code === '23505') {
//       //   throw new ConflictException('Article with this topic already exists');
//       // }
//       throw new InternalServerErrorException(
//         `Failed to update article, ${error.message}`,
//       );
//     }
//   }

//   async remove(id: number): Promise<{ message: string; success: boolean }> {
//     const result = await this.repository.delete({ QID: id });

//     if (result.affected === 0) {
//       throw new NotFoundException(`Quest with QID:${id} not found`);
//     }

//     return {
//       message: `Quest with ${id} successfully deleted`,
//       success: true,
//     };
//   }
// }
