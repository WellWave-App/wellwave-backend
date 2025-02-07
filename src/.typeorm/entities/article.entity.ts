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
import { ApiProperty } from '@nestjs/swagger';
import { DiseaseType } from './disease-types.entity';

@Entity('ARTICLE')
export class Article {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  AID: number;

  @ApiProperty({ name: 'TOPIC' })
  @Column({ type: 'varchar' })
  TOPIC: string;

  @ApiProperty({ name: 'BODY' })
  @Column({ type: 'text' })
  BODY: string;

  @ApiProperty({ name: 'ESTIMATED_READ_TIME' })
  @Column({ type: 'float' })
  ESTIMATED_READ_TIME: number; // in minutes

  @ApiProperty({ name: 'AUTHOR' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  AUTHOR: string; // if applicable

  @ApiProperty({ name: 'THUMBNAIL_URL' })
  @Column({ type: 'varchar', length: 2048, nullable: true })
  THUMBNAIL_URL: string; // for article preview

  @ApiProperty({ name: 'VIEW_COUNT' })
  @Column({ type: 'int', default: 0 })
  VIEW_COUNT: number; // for popularity tracking

  @ApiProperty({ name: 'PUBLISH_DATE' })
  @CreateDateColumn({ type: 'date' })
  PUBLISH_DATE: Date; // for sorting/filtering

  // Relationships
  @ApiProperty({ type: () => [UserReadHistory] })
  @OneToMany(() => UserReadHistory, (userRead) => userRead.article)
  userReadHistory: UserReadHistory[];

  @ApiProperty({ type: () => [DiseaseType] })
  @ManyToMany(() => DiseaseType)
  @JoinTable({
    name: 'ARTICLE_DISEASES_RELATED',
    joinColumn: {
      name: 'AID',
      referencedColumnName: 'AID',
    },
    inverseJoinColumn: {
      name: 'DISEASE_ID',
      referencedColumnName: 'DISEASE_ID',
    },
  })
  diseases: DiseaseType[];
}
