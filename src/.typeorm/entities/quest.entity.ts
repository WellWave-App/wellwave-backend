import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HabitCategories } from './habit-categories.entity';

@Entity({ name: 'QUEST' })
export class Quest {
  @PrimaryGeneratedColumn({ type: 'int', name: 'QID' })
  QID: number;

  @Column({ type: 'varchar', name: 'IMG_URL', nullable: true })
  QUEST_IMG: string;

  @Column({ type: 'varchar', name: 'QUEST_TITLE' })
  QUEST_TITLE: string;

  @Column({ type: 'varchar', name: 'QUEST_TYPE' })
  QUEST_TYPE: string;

  @Column({ type: 'float', name: 'QUEST_DAY_DURATION' })
  QUEST_DAY_DURATION: number;

  @Column({ type: 'varchar', name: 'DESCRIPTION' })
  DESCRIPTION: string;

  @Column({ type: 'int', name: 'EXP_REWARDS' })
  EXP_REWARDS: number;

  @Column({ type: 'int', name: 'GEM_REWARDS' })
  GEM_REWARDS: number;

  @Column({ type: 'time', name: 'RQ_TARGET_MINUTES', nullable: true })
  RQ_TARGET_MINUTES: Date; // for general exercise based quest

  @Column({ type: 'float', name: 'RQ_TARGET_KM_DISTANCE', nullable: true })
  RQ_TARGET_KM_DISTANCE: number; // for exercise that can measure distance

  @Column({ type: 'float', name: 'RQ_TARGET_DAYS_STREAK', nullable: true })
  RQ_TARGET_DAYS_STREAK: number; // for streak-based quests (can be use with all category)

  @Column({ type: 'float', name: 'RQ_TARGET_COUNT', nullable: true })
  RQ_TARGET_COUNT: number; // for count-based categories

  @ManyToOne(() => HabitCategories)
  @JoinColumn({ name: 'CATEGORY_ID' }) // Matches the column name in the database
  CATEGORY: HabitCategories; // Reference to the related entity
}
