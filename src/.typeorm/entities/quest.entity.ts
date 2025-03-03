import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ExerciseType, HabitCategories, TrackingType } from './habit.entity';

export enum QuestType {
  NORMAL = 'normal', // Regular tracking quests (minutes, distance, etc.) aka. milestone
  STREAK_BASED = 'streak_based', // Streak achievement quests
  COMPLETION_BASED = 'completion_based', // Challenge completion quests
  DAILY_COMPLETION_BASED = 'daily_completion_based', // Daily habit completion quests
}
/**
 * quest patterns examples
 * (milstone)
 * (exercises) for (x) minutes in a (n) days/weeks/months
 * (walk) (x) steps in a (n) days/weeks/months
 * (walk/run/cycling) (x) km in a (n) days/weeks/months
 * complete (x) daily tracking habits in a (n) days/weeks/months
 * complete (x) (diet/exercise/sleep) habit challenge for a (n) days/weeks/months
 *
 * (streak)
 * complete (x) streaks daily tracking habits in a (n) days/weeks/months
 * complete (x) streaks (diet/exercise/sleep) daily tracking challenge for a (n) days/weeks/months
 * exercise (x) minutes per days/weeks/month in a row
 */

@Entity({ name: 'QUEST' })
export class Quest {
  @PrimaryGeneratedColumn({ type: 'int', name: 'QID' })
  QID: number; //QUEST_ID

  @Column({ type: 'varchar', name: 'IMG_URL', nullable: true })
  IMG_URL: string; //QUEST_IMG

  @Column({ type: 'varchar', name: 'TITLE' })
  TITLE: string;

  @Column({ type: 'float', name: 'DAY_DURATION' })
  DAY_DURATION: number; // QUEST_DAY_DURATION

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
