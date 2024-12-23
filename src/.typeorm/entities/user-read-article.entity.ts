import { Column, Entity, ManyToOne, PrimaryColumn, Timestamp } from 'typeorm';
import { Article } from './article.entity';
import { UserEntity } from './users.entity';

@Entity('USER_READ_ARTICLE')
export class UserReadArticle {
  @PrimaryColumn({ type: 'int' })
  UID: number; // PK [ref: > USERS.UID]

  @PrimaryColumn({ type: 'varchar' })
  AID: string; // PK [ref: > ARTICLE.AID]

  @Column({ type: 'boolean' })
  IS_READ: boolean;

  @Column({ type: 'boolean' })
  IS_BOOKMARK: boolean;

  @Column({ type: 'float' })
  READING_PROGRESS: number; // percentage of article read

  @Column({ type: 'float' })
  RATING: number; // optional: user rating

  @Column({ type: 'timestamp' })
  READ_DATE: Timestamp; // track when they read it

  @ManyToOne(()=> Article, art => art.userReads)
  article: Article

  @ManyToOne(()=> UserEntity, user => user.userReads)
  user: UserEntity
}
