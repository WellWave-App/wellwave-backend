import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiseaseTypesService } from '../services/disease-types.service';
import { CreateDiseaseTypeDto } from '../dto/create-disease-type.dto';
import { UpdateDiseaseTypeDto } from '../dto/update-disease-type.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Disease Types')
@Controller('disease-types')
export class DiseaseTypesController {
  constructor(private readonly diseaseTypesService: DiseaseTypesService) {}

  @Post()
  create(@Body() createDiseaseTypeDto: CreateDiseaseTypeDto) {
    return this.diseaseTypesService.create(createDiseaseTypeDto);
  }

  @Get()
  findAll() {
    return this.diseaseTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diseaseTypesService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiseaseTypeDto: UpdateDiseaseTypeDto,
  ) {
    return this.diseaseTypesService.update(+id, updateDiseaseTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diseaseTypesService.remove(+id);
  }
}
