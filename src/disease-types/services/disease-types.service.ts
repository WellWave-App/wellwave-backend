import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiseaseTypeDto } from '../dto/create-disease-type.dto';
import { UpdateDiseaseTypeDto } from '../dto/update-disease-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiseaseType } from '@/.typeorm/entities/disease-types.entity';
import { In, Repository } from 'typeorm';
import { PaginatedResponse } from '@/response/response.interface';

@Injectable()
export class DiseaseTypesService {
  constructor(
    @InjectRepository(DiseaseType)
    private diseaseTypes: Repository<DiseaseType>,
  ) {}

  async create(dto: CreateDiseaseTypeDto): Promise<DiseaseType> {
    try {
      const newType = this.diseaseTypes.create(dto);
      return await this.diseaseTypes.save(newType);
    } catch (error) {
      if (error.code === '23505') {
        // PostgreSQL unique violation
        throw new ConflictException('Product with this name already exists');
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(): Promise<PaginatedResponse<DiseaseType>> {
    const allTypes = await this.diseaseTypes.find({
      order: { DISEASE_ID: 'ASC' },
      select: ['DISEASE_ID', 'TH_NAME', 'ENG_NAME', 'DESCRIPTION'],
    });
    return { data: allTypes, meta: { total: allTypes.length } };
  }

  async findById(id: number): Promise<DiseaseType> {
    const type = await this.diseaseTypes.findOne({
      where: { DISEASE_ID: id },
      select: ['DISEASE_ID', 'TH_NAME', 'ENG_NAME', 'DESCRIPTION'],
    });

    if (!type) {
      throw new NotFoundException(`DiseasesTypes with DISEASE_ID: ${id} not`);
    }

    return type;
  }

  async findByIds(ids: number[]): Promise<DiseaseType[]> {
    if (!ids || ids.length === 0) {
      throw new NotFoundException('No valid disease type IDs provided');
    }

    const diseaseTypes = await this.diseaseTypes.findBy({
      DISEASE_ID: In([ids]),
    });

    if (diseaseTypes.length === 0) {
      throw new NotFoundException('No DiseaseTypes found for the provided IDs');
    }

    return diseaseTypes;
  }

  async update(id: number, dto: UpdateDiseaseTypeDto): Promise<DiseaseType> {
    const type = this.findById(id);

    try {
      const updated = Object.assign(type, dto);
      return await this.diseaseTypes.save(updated);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Product with this name already exists');
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async remove(id: number): Promise<{ message: string; success: boolean }> {
    // const type = await this.findById(id);
    // await this.diseaseTypes.remove(type);
    // return { message: 'Delete Successful' };
    const result = await this.diseaseTypes.delete({ DISEASE_ID: id });
    if (result.affected === 0) {
      throw new NotFoundException(
        `DiseaseTypes with DISEASE_ID: ${id} not found`,
      );
    }

    return { message: 'Delete Successful', success: true };
  }
}
