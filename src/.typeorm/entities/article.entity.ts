import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserReadArticle } from './user-read-article.entity';
import { ArticleDiseasesEntity } from './article-diseases.entity';

@Entity('ARTICLE')
export class Article {
  @PrimaryGeneratedColumn()
  AID: string;

  @Column({ type: 'varchar' })
  TOPIC: string;

  @Column({ type: 'text' })
  BODY: string;

  @Column({ type: 'float' })
  ESTIMATED_READ_TIME: number; // in minutes

  @Column({ type: 'varchar', length: 100 })
  AUTHOR: string; // if applicable

  @Column({ type: 'varchar', length: 2048 })
  THUMBNAIL_URL: string; // for article preview

  @Column({ type: 'int' })
  VIEW_COUNT: number; // for popularity tracking

  @Column({ type: 'date' })
  PUBLISH_DATE: Date; // for sorting/filtering

  @OneToMany(() => ArticleDiseasesEntity, (artDs) => artDs.article)
  artDiseases: ArticleDiseasesEntity[];

  @OneToMany(() => UserReadArticle, (userRead) => userRead.article)
  userReads: UserReadArticle[];
}
