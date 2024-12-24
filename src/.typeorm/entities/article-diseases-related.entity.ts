import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { DiseaseType } from './disease-types.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ARTICLE_DISEASES')
export class ArticleDiseasesRelated {
  @ApiProperty()
  @PrimaryColumn({ type: 'int' })
  AID: number; //  [ref: > ARTICLE.AID]

  @ApiProperty()
  @PrimaryColumn({ type: 'int' })
  DISEASE_ID: number; // [ ref: > DISEASE_TYPES.DISEASE_ID]

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  // Relationships
  @ApiProperty({ type: () => Article })
  @ManyToOne(() => Article, (article) => article.articleDiseases)
  @JoinColumn({ name: 'AID' })
  article: Article;

  @ApiProperty({ type: () => DiseaseType })
  @ManyToOne(() => DiseaseType, (disease) => disease.articleDiseases)
  @JoinColumn({ name: 'DISEASE_ID' })
  disease: DiseaseType;
}
