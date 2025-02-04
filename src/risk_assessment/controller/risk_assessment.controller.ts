import {
  Controller,
  Post,
  Put,
  Delete,
  Get,
  Param,
  Body,
} from '@nestjs/common';
import { RiskAssessmentService } from '../service/risk_assessment.service';
import { CreateRiskAssessmentDto } from '../dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from '../dto/update-risk-assessment.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Risk Assessment')
@Controller('risk-assessment')
export class RiskAssessmentController {
  constructor(private readonly riskAssessmentService: RiskAssessmentService) {}

  @Post(':uid')
  @ApiOperation({ summary: 'Create a new risk assessment for a user' })
  @ApiParam({ name: 'uid', type: Number, description: 'User ID' })
  @ApiBody({ type: CreateRiskAssessmentDto })
  @ApiResponse({
    status: 201,
    description: 'Risk assessment created successfully',
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  create(
    @Param('uid') uid: number,
    @Body() createRiskDto: CreateRiskAssessmentDto,
  ) {
    return this.riskAssessmentService.create(uid, createRiskDto);
  }

  @Put(':uid')
  @ApiOperation({ summary: 'Update an existing risk assessment' })
  @ApiParam({ name: 'uid', type: Number, description: 'User ID' })
  @ApiBody({ type: UpdateRiskAssessmentDto })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Risk assessment not found' })
  update(
    @Param('uid') uid: number,
    @Body() updateRiskDto: UpdateRiskAssessmentDto,
  ) {
    return this.riskAssessmentService.update(uid, updateRiskDto);
  }

  @Delete(':uid')
  @ApiOperation({ summary: 'Delete a risk assessment' })
  @ApiParam({ name: 'uid', type: Number, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Risk assessment not found' })
  remove(@Param('uid') uid: number) {
    return this.riskAssessmentService.remove(uid);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users’ risk assessments' })
  @ApiResponse({
    status: 200,
    description: 'List of risk assessments returned successfully',
  })
  findAllUser() {
    return this.riskAssessmentService.findAllUser();
  }

  @Get(':uid')
  @ApiOperation({ summary: 'Get a specific user’s risk assessment' })
  @ApiParam({ name: 'uid', type: Number, description: 'User ID' })
  @ApiResponse({
    status: 200,
    description: 'Risk assessment retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Risk assessment not found' })
  findOneUser(@Param('uid') uid: number) {
    return this.riskAssessmentService.findOneUser(uid);
  }
}
