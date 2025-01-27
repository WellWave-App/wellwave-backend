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
// import { UpdateUserQuestDto } from '../dtos/update-uq.dto';
// import { CreateUserQuestDto } from '../dtos/create-uq.dto';
// import {
//   QuestStatus,
//   UserQuests,
// } from '@/.typeorm/entities/user-quests.entity';

// export interface UserQuestParams {
//   page?: number;
//   limit?: number;
//   uid?: number;
//   qid?: number;
//   status?: QuestStatus;
//   // query?: string;
//   // categoryId?: number;
// }

// @Injectable()
// export class UserQuestRepository {
//   constructor(
//     @InjectRepository(UserQuests)
//     private readonly repository: Repository<UserQuests>,
//   ) {}

//   async findById(QID: number, UID: number): Promise<UserQuests | null> {
//     return await this.repository.findOne({ where: { QID, UID } });
//   }

//   async findByIdOrFail(QID: number, UID: number): Promise<UserQuests> {
//     const userQuest = await this.findById(QID, UID);
//     if (!userQuest)
//       throw new NotFoundException(`QID: ${QID}, UID: ${UID} not found`);
//     return userQuest;
//   }

//   async create(data: Partial<UserQuests>): Promise<UserQuests> {
//     try {
//       const quest = this.repository.create(data);
//       return await this.repository.save(quest);
//     } catch (error) {
//       this.handleDatabaseError(error);
//     }
//   }

//   async findAll(
//     params: UserQuestParams,
//   ): Promise<{ data: UserQuests[]; total: number }> {
//     const { page = 1, limit = 10, qid, uid, status } = params;

//     const queryBuilder = this.repository.createQueryBuilder('userQuest');

//     if (uid) {
//       queryBuilder.andWhere('userQuest.UID = :uid', { uid });
//     }

//     if (qid) {
//       queryBuilder.andWhere('userQuest.QID = :qid', { qid });
//     }

//     if (status) {
//       queryBuilder.andWhere('userQuest.STATUS = :status:', { status });
//     }

//     const [data, total] = await queryBuilder
//       .skip(page * 1 - limit)
//       .take(limit)
//       .orderBy({
//         'userQuest.END_DATE': 'DESC',
//       })
//       .getManyAndCount();

//     return {
//       data,
//       total,
//     };
//   }

//   async update(qid: number, uid: number, data: Partial<UserQuests>) {
//     try {
//       await this.repository.update({ QID: qid, UID: uid }, data);
//       return await this.findById(qid, uid);
//     } catch (error) {
//       this.handleDatabaseError(error);
//     }
//   }

//   private handleDatabaseError(error: any): Error {
//     if (error.code === '23505') {
//       throw new ConflictException(`${error.message}`);
//     }
//     throw new InternalServerErrorException(`${error.message}`);
//   }
// }
