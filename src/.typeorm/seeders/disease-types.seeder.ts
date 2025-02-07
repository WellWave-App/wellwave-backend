// src/database/seeders/disease-types.seeder.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiseaseType } from '../entities/disease-types.entity';
import { diseaseTypesSeedData } from '../seeds/disease-types.seed';

@Injectable()
export class DiseaseTypesSeeder {
  constructor(
    @InjectRepository(DiseaseType)
    private readonly diseaseTypesRepository: Repository<DiseaseType>,
  ) {}

  async seed() {
    // Check if data already exists
    const existingCount = await this.diseaseTypesRepository.count();

    if (existingCount === 0) {
      // Insert seed data only if table is empty
      await this.diseaseTypesRepository.insert(diseaseTypesSeedData);
    }
  }
}
