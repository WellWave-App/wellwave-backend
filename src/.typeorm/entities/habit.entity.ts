// habit.entity.ts
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum HABIT_TYPE {
  EXERCISE = 'exercise',
  DIET = 'diet',
  SLEEP = 'sleep',
}

export enum MOOD_FEEDBACK {
  FRUSTRATED = 'ท้อแท้',
  PRESSURED = 'กดดัน',
  NEUTRAL = 'เฉยๆ',
  SATISFIED = 'พอใจ',
  ENERGETIC = 'สดใส',
}

export enum DIFFICULTY_LEVEL {
  EASY = 1,
  MEDIUM = 2,
  HARD = 3,
}

@Entity('HABIT')
export class HabitEntity {
  @PrimaryGeneratedColumn()
  HID: number;

  @Column()
  HABIT_TITLE: string;

  @Column()
  DESCRIPTION: string;

  @Column({
    type: 'enum',
    enum: HABIT_TYPE,
  })
  HABIT_TYPE: HABIT_TYPE;

  @Column()
  HABIT_ADVICE: string;

  @Column()
  EXP_REWARD: number;

  @Column()
  GEM_REWARD: number;

  @Column()
  DIABETES_CONDITION: boolean;

  @Column()
  OBESITY_CONDITION: boolean;

  @Column()
  DYSLIPIDEMIA_CONDITION: boolean;

  @Column()
  HYPERTENSION_CONDITION: boolean;

  @Column({
    type: 'enum',
    enum: DIFFICULTY_LEVEL,
  })
  DIFFICULTY_LEVEL: DIFFICULTY_LEVEL;

  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  createAt: Date;
}
