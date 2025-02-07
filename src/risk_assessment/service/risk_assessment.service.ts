import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAssessmentEntity } from 'src/.typeorm/entities/assessment.entity'; // แก้ไขตามตำแหน่งไฟล์
import { User } from 'src/.typeorm/entities/users.entity'; // แก้ไขตามตำแหน่งไฟล์
import { CreateRiskAssessmentDto } from '../dto/create-risk-assessment.dto';
import { UpdateRiskAssessmentDto } from '../dto/update-risk-assessment.dto';

@Injectable()
export class RiskAssessmentService {
  constructor(
    @InjectRepository(RiskAssessmentEntity)
    private riskAssessmentRepository: Repository<RiskAssessmentEntity>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // สร้างข้อมูลการประเมินความเสี่ยง
  async create(
    uid: number,
    createRiskDto: CreateRiskAssessmentDto,
  ): Promise<RiskAssessmentEntity> {
    const user = await this.userRepository.findOne({ where: { UID: uid } });

    if (!user) {
      throw new NotFoundException(`User with UID ${uid} not found`);
    }

    // ใช้ DTO เพื่อสร้าง risk assessment entity
    const riskAssessment = this.riskAssessmentRepository.create({
      ...createRiskDto, // ใช้ DTO
      USER: user, // เชื่อมโยง user entity
      UID: uid,
    });

    // ตรวจสอบว่า save คืนค่า entity เดียว
    return this.riskAssessmentRepository.save(riskAssessment);
  }

  // อัปเดตข้อมูลการประเมินความเสี่ยง
  async update(
    uid: number,
    updateRiskDto: UpdateRiskAssessmentDto, // เปลี่ยนจาก any เป็น DTO
  ): Promise<RiskAssessmentEntity> {
    const riskAssessment = await this.riskAssessmentRepository.findOne({
      where: { UID: uid },
    });

    if (!riskAssessment) {
      throw new NotFoundException(`Risk assessment for UID ${uid} not found`);
    }

    Object.assign(riskAssessment, updateRiskDto); // ใช้ DTO
    return this.riskAssessmentRepository.save(riskAssessment);
  }

  // ลบข้อมูลการประเมินความเสี่ยง
  async remove(uid: number): Promise<{ message: string; success: boolean }> {
    const result = await this.riskAssessmentRepository.delete({ UID: uid });

    if (result.affected === 0) {
      throw new NotFoundException(`Risk assessment for UID ${uid} not found`);
    }

    return {
      message: `Risk assessment for UID ${uid} deleted successfully`,
      success: true,
    };
  }

  // ค้นหาข้อมูลการประเมินความเสี่ยงของผู้ใช้ทุกคน
  async findAllUser(): Promise<RiskAssessmentEntity[]> {
    return this.riskAssessmentRepository.find({ relations: ['USER'] });
  }

  // ค้นหาข้อมูลการประเมินความเสี่ยงของผู้ใช้คนเดียว
  async findOneUser(uid: number): Promise<RiskAssessmentEntity> {
    const riskAssessment = await this.riskAssessmentRepository.findOne({
      where: { UID: uid },
      relations: ['USER'],
    });

    if (!riskAssessment) {
      throw new NotFoundException(`Risk assessment for UID ${uid} not found`);
    }

    return riskAssessment;
  }
}
