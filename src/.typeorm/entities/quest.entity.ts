import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseType, HabitCategories, TrackingType } from './habit.entity';

export enum QuestType {
  NORMAL = 'normal', // Regular tracking quests (minutes, distance, etc.)
  STREAK_BASED = 'streak_based', // Streak achievement quests
  COMPLETION_BASED = 'completion_based', // Challenge completion quests
  DAILY_COMPLETION = 'daily_completion', // Daily habit completion quests
  // START_BASED = 'start_based', // Starting new habits quests
}

@Entity({ name: 'QUEST' })
export class Quest {
  @PrimaryGeneratedColumn({ type: 'int', name: 'QID' })
  QID: number;

  @Column({ type: 'varchar', name: 'IMG_URL', nullable: true })
  IMG_URL: string;

  @Column({ type: 'varchar', name: 'TITLE' })
  TITLE: string;

  @Column({ type: 'float', name: 'DAY_DURATION' })
  DAY_DURATION: number;

  @Column({ type: 'text', name: 'DESCRIPTION' })
  DESCRIPTION: string;

  @Column({
    name: 'RELATED_HABIT_CATEGORY',
    type: 'enum',
    enum: HabitCategories,
  })
  RELATED_HABIT_CATEGORY: HabitCategories;

  @Column({
    name: 'EXERCISE_TYPE',
    type: 'enum',
    enum: ExerciseType,
    nullable: true,
  })
  EXERCISE_TYPE: ExerciseType;

  @Column({
    name: 'TRACKING_TYPE',
    type: 'enum',
    enum: TrackingType,
  })
  TRACKING_TYPE: TrackingType;

  @Column({ type: 'int', name: 'EXP_REWARDS', nullable: true, default: 0 })
  EXP_REWARDS: number;

  @Column({ type: 'int', name: 'GEM_REWARDS', nullable: true, default: 0 })
  GEM_REWARDS: number;

  @Column({ type: 'float', name: 'RQ_TARGET_VALUE', default: 0 })
  RQ_TARGET_VALUE: number; // Generic target field (minutes/distance/count)

  @Column({
    name: 'QUEST_TYPE',
    type: 'enum',
    enum: QuestType,
    // default: QuestType.NORMAL,
  })
  QUEST_TYPE: QuestType;

  @CreateDateColumn({ name: 'CREATED_AT', type: 'date' })
  CREATED_AT: Date;

  @UpdateDateColumn({ name: 'UPDATED_AT', type: 'date' })
  UPDATED_AT: Date;
}
