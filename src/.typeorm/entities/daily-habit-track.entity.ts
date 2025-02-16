import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserHabits } from './user-habits.entity';
import { Habits } from './habit.entity';
import { User } from './users.entity';
import { ExerciseCalculator } from '../../mission/habit/utils/exercise-calculator.util';

export enum DailyStatus {
  COMPLETE = 'complete',
  ACTIVE = 'acive',
  FAILED = 'failed',
}

export enum Moods {
  HOPELESS = 'ท้อแท้',
  STRESSED = 'กดดัน',
  NEUTRAL = 'เฉยๆ',
  SATISFIED = 'พอใจ',
  CHEERFUL = 'สดใส',
}

@Entity('DAILY_HABIT_TRACK')
export class DailyHabitTrack {
  @PrimaryGeneratedColumn({ name: 'TRACK_ID', type: 'int' })
  TRACK_ID: number;

  @Column({ name: 'CHALLENGE_ID', type: 'int' })
  CHALLENGE_ID: number; // PK [ref: > USER_HABITS_CHALLENGE.CHALLENGE_ID]

  @Column({ name: 'TRACK_DATE', type: 'date', default: new Date() })
  TRACK_DATE: Date; // PK

  // @Column({
  //   name: 'STATUS',
  //   type: 'enum',
  //   enum: DailyStatus,
  //   default: DailyStatus.ACTIVE,
  // })
  // STATUS: DailyStatus;

  @Column({ name: 'COMPLETED', type: 'boolean', default: false })
  COMPLETED: boolean; // Boolean completion for sleep/diet and also set to complete if exercise met goal

  @Column({ name: 'DURATION_MINUTES', type: 'float', nullable: true })
  DURATION_MINUTES: number; // Duration tracking for exercises

  @Column({ name: 'DISTANCE_KM', type: 'float', nullable: true })
  DISTANCE_KM: number; // Distance tracking for walking/running

  @Column({ name: 'COUNT_VALUE', type: 'int', nullable: true })
  COUNT_VALUE: number; // Count-based tracking for steps

  @Column({ name: 'STEPS_CALCULATED', type: 'int', nullable: true })
  STEPS_CALCULATED: number;

  @Column({ name: 'CALORIES_BURNED', type: 'int', nullable: true })
  CALORIES_BURNED: number;

  @Column({ name: 'HEART_RATE', type: 'int', nullable: true })
  HEART_RATE: number;

  calculateMetrics(user: User, habit: Habits) {
    if (this.DURATION_MINUTES && habit.EXERCISE_TYPE) {
      this.STEPS_CALCULATED = ExerciseCalculator.calculateSteps(
        this.DURATION_MINUTES,
        habit.EXERCISE_TYPE,
        user,
      );

      this.CALORIES_BURNED = ExerciseCalculator.calculateCaloriesBurned(
        this.DURATION_MINUTES,
        habit.EXERCISE_TYPE,
        user,
      );

      this.HEART_RATE = ExerciseCalculator.calculateHeartRate(
        habit.EXERCISE_TYPE,
        user,
        0.7, // default intensity at 70%
      );
    }
  }

  @Column({
    type: 'enum',
    enum: Moods,
    nullable: true,
  })
  MOOD_FEEDBACK: Moods; // Mood options

  @ManyToOne(() => UserHabits, (userHabits) => userHabits.dailyTracks)
  @JoinColumn({ name: 'CHALLENGE_ID' })
  UserHabits: UserHabits;
}
