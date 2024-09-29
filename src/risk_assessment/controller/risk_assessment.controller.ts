import { Controller, Post, Put, Delete, Get, Param, Body } from '@nestjs/common';
import { RiskAssessmentService } from '../service/risk_assessment.service'; 
import { CreateRiskAssessmentDto } from '../dto/create-risk-assessment.dto'; 
import { UpdateRiskAssessmentDto } from '../dto/update-risk-assessment.dto'; 

@Controller('risk-assessment')
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  
  @Post(':uid')
  create(@Param('uid') uid: number, @Body() createRiskDto: CreateRiskAssessmentDto) {
    return this.riskAssessmentService.create(uid, createRiskDto);
  }

  
  @Put(':uid')
  update(@Param('uid') uid: number, @Body() updateRiskDto: UpdateRiskAssessmentDto) { 
    return this.riskAssessmentService.update(uid, updateRiskDto);
  }

  
  @Delete(':uid')
  remove(@Param('uid') uid: number) {
    return this.riskAssessmentService.remove(uid);
  }

  
  @Get()
  findAllUser() {
    return this.riskAssessmentService.findAllUser();
  }

  
  @Get(':uid')
  findOneUser(@Param('uid') uid: number) {
    return this.riskAssessmentService.findOneUser(uid);
  }
}




