import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseType, HabitCategories, TrackingType } from './habit.entity';

export enum QuestType {
  NORMAL = 'normal', // Regular tracking quests (minutes, distance, etc.)
  STREAK_BASED = 'streak_based', // Streak achievement quests
  COMPLETION_BASED = 'completion_based', // Challenge completion quests
  START_BASED = 'start_based', // Starting new habits quests
  DAILY_COMPLETION = 'daily_completion', // Daily habit completion quests
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
    name: 'CATEGORY',
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

  @Column({ type: 'float', name: 'TARGET_VALUE', default: 0 })
  RQ_TARGET_VALUE: number; // Generic target field (minutes/distance/count)

  @Column({
    name: 'QUEST_TYPE',
    type: 'enum',
    enum: QuestType,
    // default: QuestType.NORMAL,
  })
  QUEST_TYPE: QuestType;
  // @Column({
  //   type: 'float',
  //   name: 'RQ_TARGET_MINUTES',
  //   nullable: true,
  //   default: 0,
  // })
  // RQ_TARGET_MINUTES: number; // for general exercise based quest

  // @Column({
  //   type: 'float',
  //   name: 'RQ_TARGET_KM_DISTANCE',
  //   nullable: true,
  //   default: 0,
  // })
  // RQ_TARGET_KM_DISTANCE: number; // for exercise that can measure distance

  // @Column({
  //   type: 'float',
  //   name: 'RQ_TARGET_DAYS_STREAK',
  //   nullable: true,
  //   default: 0,
  // })
  // RQ_TARGET_DAYS_STREAK: number; // for streak-based quests (can be use with all category)

  // @Column({
  //   type: 'float',
  //   name: 'RQ_TARGET_COUNT',
  //   nullable: true,
  //   default: 0,
  // })
  // RQ_TARGET_COUNT: number; // for count-based categories

  @CreateDateColumn({ name: 'createAt', type: 'date' })
  createAt: Date;

  @UpdateDateColumn({ name: 'updateAt', type: 'date' })
  updateAt: Date;
}
