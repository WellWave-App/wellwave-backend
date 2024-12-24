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
import { Repository } from 'typeorm';
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

  async remove(id: number): Promise<{ message: string }> {
    const type = await this.findById(id);
    await this.diseaseTypes.remove(type);
    return { message: 'Delete Successful' };
  }
}
