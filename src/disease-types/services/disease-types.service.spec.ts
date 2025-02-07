import { Test, TestingModule } from '@nestjs/testing';
import { DiseaseTypesService } from './disease-types.service';

describe('DiseaseTypesService', () => {
  let service: DiseaseTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DiseaseTypesService],
    }).compile();

    service = module.get<DiseaseTypesService>(DiseaseTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
