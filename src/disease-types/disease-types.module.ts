import { Module } from '@nestjs/common';
import { DiseaseTypesService } from './services/disease-types.service';
import { DiseaseTypesController } from './controllers/disease-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiseaseType } from '../.typeorm/entities/disease-types.entity';
import { DiseaseTypesSeeder } from '@/.typeorm/seeders/disease-types.seeder';

@Module({
  imports: [TypeOrmModule.forFeature([DiseaseType])],
  controllers: [DiseaseTypesController],
  providers: [DiseaseTypesService, DiseaseTypesSeeder],
  exports: [DiseaseTypesSeeder, DiseaseTypesService],
})
export class DiseaseTypesModule {
  constructor(private seeder: DiseaseTypesSeeder) {}

  // Optional: if you want to run the seeder when the module initializes
  async onModuleInit() {
    await this.seeder.seed();
  }
}
