import { Test, TestingModule } from '@nestjs/testing';
import { DiseaseTypesController } from './disease-types.controller';
import { DiseaseTypesService } from '../services/disease-types.service';

describe('DiseaseTypesController', () => {
  let controller: DiseaseTypesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiseaseTypesController],
      providers: [DiseaseTypesService],
    }).compile();

    controller = module.get<DiseaseTypesController>(DiseaseTypesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
