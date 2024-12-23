import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';
import { Article } from './article.entity';
import { DiseaseTypes } from './disease-types.entity';

@Entity('ARTICLE_DISEASES')
export class ArticleDiseasesEntity {
  @PrimaryColumn({ type: 'varchar' })
  AID: number; //  [ref: > ARTICLE.AID]

  @PrimaryColumn({ type: 'varchar' })
  DISEASE_ID: number; // [ ref: > DISEASE_TYPES.DISEASE_ID]

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // relations
  @ManyToOne(() => Article, (article) => article.AID)
  article: Article;

  @ManyToOne(() => DiseaseTypes, (disease) => disease.DISEASE_ID)
  diseasesType: DiseaseTypes;
}
