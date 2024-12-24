import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserReadHistory } from './user-read-history.entity';
import { ArticleDiseasesRelated } from './article-diseases-related.entity';
import { ApiProperty } from '@nestjs/swagger';
import { DiseaseType } from './disease-types.entity';

@Entity('ARTICLE')
export class Article {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  AID: number;

  @ApiProperty()
  @Column({ type: 'varchar' })
  TOPIC: string;

  @ApiProperty()
  @Column({ type: 'text' })
  BODY: string;

  @ApiProperty()
  @Column({ type: 'float' })
  ESTIMATED_READ_TIME: number; // in minutes

  @ApiProperty()
  @Column({ type: 'varchar', length: 100, nullable: true })
  AUTHOR: string; // if applicable

  @ApiProperty()
  @Column({ type: 'varchar', length: 2048, nullable: true })
  THUMBNAIL_URL: string; // for article preview

  @ApiProperty()
  @Column({ type: 'int', default: 0 })
  VIEW_COUNT: number; // for popularity tracking

  @ApiProperty()
  @CreateDateColumn({ type: 'date' })
  PUBLISH_DATE: Date; // for sorting/filtering

  // Relationships

  // Relationship with UserReadArticle
  @ApiProperty({ type: () => [UserReadHistory] })
  @OneToMany(() => UserReadHistory, (userRead) => userRead.article)
  userReadHistory: UserReadHistory[];

  @ApiProperty({ type: () => [ArticleDiseasesRelated] })
  @OneToMany(() => ArticleDiseasesRelated, articleDisease => articleDisease.article)
    articleDiseases: ArticleDiseasesRelated[];
}
