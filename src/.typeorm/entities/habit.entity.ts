import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HabitCategories } from './habit-categories.entity';

export enum DifficultLevel {
  EASY = 0,
  MEDIUM = 1,
  HARD = 2,
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
  HABIT_TITLE: string;

  @Column({ name: 'DESCRIPTION', type: 'text', nullable: true })
  DESCRIPTION: string;

  @Column({ name: 'HABIT_ADVICE', type: 'text', nullable: true })
  HABIT_ADVICE: string;

  @Column({ name: 'EXP_REWARD', type: 'int' })
  EXP_REWARD: number;

  @Column({ name: 'GEM_REWARD', type: 'int' })
  GEM_REWARD: number;

  @Column({ name: 'DEFAULT_DURATION_MINUTES', type: 'int', nullable: true })
  DEFAULT_DURATION_MINUTES: number;

  @Column({ name: 'DEFAULT_DAYS_GOAL', type: 'int', nullable: true })
  DEFAULT_DAYS_GOAL: number;

  @Column({
    name: 'DIFFICULTY_LEVEL',
    type: 'enum',
    enum: DifficultLevel,
    nullable: true,
  })
  DIFFICULTY_LEVEL: DifficultLevel;

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

  @ManyToOne(() => HabitCategories)
  @JoinColumn({ name: 'CATEGORY_ID' })
  CATEGORY: HabitCategories;
}
