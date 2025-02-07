import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
} from 'typeorm';
import { Article } from './article.entity';
import { User } from './users.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('USER_READ_HISTORY')
export class UserReadHistory {
  @ApiProperty()
  @PrimaryColumn({ type: 'int', unique: true })
  UID: number; // PK [ref: > USERS.UID]

  @ApiProperty()
  @PrimaryColumn({ type: 'varchar', unique: true })
  AID: number; // PK [ref: > ARTICLE.AID]

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  IS_READ: boolean;

  @ApiProperty()
  @Column({ type: 'boolean', default: false })
  IS_BOOKMARK: boolean;

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  READING_PROGRESS: number; // percentage of article read (not used)

  @ApiProperty()
  @Column({ type: 'float', nullable: true })
  RATING: number; // optional: user rating (not used)

  @ApiProperty()
  @CreateDateColumn({ type: 'date' })
  FIRST_READ_DATE: Date; // track when they read it

  @ApiProperty()
  @Column({ type: 'date' })
  LASTED_READ_DATE: Date; // track when they read it

  // Relations
  @ApiProperty({ type: () => User })
  @ManyToOne(() => User, (user) => user.articleReadHistory)
  @JoinColumn({ name: 'UID' })
  user: User;

  @ApiProperty({ type: () => Article })
  @ManyToOne(() => Article, (article) => article.userReadHistory)
  @JoinColumn({ name: 'AID' })
  article: Article;
}
