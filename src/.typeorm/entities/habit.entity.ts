import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum HabitCategories {
  Exercise = 'exercise',
  Diet = 'diet',
  Sleep = 'sleep',
}

export enum DifficultLevel {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
}

export enum ExerciseType {
  Walking = 'walking',
  Running = 'running',
  Cycling = 'cycling',
  Swimming = 'swimming',
  Strength = 'strength',
  HIIT = 'hiit',
  Yoga = 'yoga',
  Other = 'other',
}

export enum TrackingType {
  Duration = 'duration', // For timed activities (exercise)
  Distance = 'distance', // For distance-based activities (walking, running)
  Boolean = 'boolean', // For yes/no activities (sleep, diet)
  Count = 'count', // For counted activities (steps, repetitions)
}

export interface Conditions {
  DIABETES_CONDITION: boolean;
  OBESITY_CONDITION: boolean;
  DYSLIPIDEMIA_CONDITION: boolean;
  HYPERTENSION_CONDITION: boolean;
}

@Entity('HABIT')
export class Habits {
  @PrimaryGeneratedColumn({ name: 'HID', type: 'int' })
  HID: number;

  @Column({ name: 'HABIT_TITLE', type: 'varchar', length: 255 })
  TITLE: string;

  @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
  DESCRIPTION: string;

  @Column({ name: 'HABIT_ADVICE', type: 'text', nullable: true })
  ADVICE: string;

  @Column({
    name: 'CATEGORY',
    type: 'enum',
    enum: HabitCategories,
  })
  CATEGORY: HabitCategories;

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

  @Column({ name: 'EXP_REWARD', type: 'int' })
  EXP_REWARD: number;

  @Column({ name: 'GEM_REWARD', type: 'int' })
  GEM_REWARD: number;

  @Column({ name: 'DEFAULT_DAILY_MINUTE_GOAL', type: 'int', nullable: true })
  DEFAULT_DAILY_MINUTE_GOAL: number;

  @Column({ name: 'DEFAULT_DAYS_GOAL', type: 'int', nullable: true })
  DEFAULT_DAYS_GOAL: number;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  THUMBNAIL_URL: string;

  @Column({ type: 'bool', default: false })
  IS_DAILY: boolean;
  // @Column({
  //   name: 'DIFFICULTY_LEVEL',
  //   type: 'enum',
  //   enum: DifficultLevel,
  //   nullable: true,
  // })
  // DIFFICULTY_LEVEL: DifficultLevel;

  @Column({
    type: 'jsonb',
    name: 'CONDITIONS',
    default: {
      DIABETES_CONDITION: false,
      OBESITY_CONDITION: false,
      DYSLIPIDEMIA_CONDITION: false,
      HYPERTENSION_CONDITION: false,
    },
  })
  CONDITIONS: Conditions;
}
