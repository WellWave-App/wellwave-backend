import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('DISEASE_TYPE')
export class DiseaseType {
  @ApiProperty({ description: 'Unique identifier for the disease type' })
  @PrimaryColumn()
  DISEASE_ID: number;

  @ApiProperty({
    description: 'Disease name in Thai language',
    example: 'ความดันโลหิตสูง',
  })
  @Column()
  TH_NAME: string;

  @ApiProperty({
    description: 'Disease name in English',
    example: 'Hypertension',
  })
  @Column()
  ENG_NAME: string;

  @ApiProperty({ description: 'Detailed description of the disease' })
  @Column({ type: 'text', nullable: true })
  DESCRIPTION?: string;

  @ApiProperty({
    description: 'Timestamp when the disease type was created',
    type: Date,
  })
  @CreateDateColumn()
  CREATED_AT: Date;
}
