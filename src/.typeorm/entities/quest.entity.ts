export enum QUEST_TYPE {
  // Exercise quests
  EXERCISE_DURATION = 'EXERCISE_DURATION',
  EXERCISE_STREAK = 'EXERCISE_STREAK',
  EXERCISE_SESSIONS = 'EXERCISE_SESSIONS',
  EXERCISE_CALORIES = 'EXERCISE_CALORIES',

  // Diet quests
  DIET_STREAK = 'DIET_STREAK',
  DIET_SESSIONS = 'DIET_SESSIONS',
  WATER_INTAKE = 'WATER_INTAKE',
  CALORIE_GOAL = 'CALORIE_GOAL',

  // Sleep quests
  SLEEP_DURATION = 'SLEEP_DURATION',
  SLEEP_STREAK = 'SLEEP_STREAK',
  SLEEP_QUALITY = 'SLEEP_QUALITY',

  // Combined quests
  DAILY_ALL = 'DAILY_ALL',
  WEEKLY_GOAL = 'WEEKLY_GOAL',

  // Community quests
  COMMUNITY_STEPS = 'COMMUNITY_STEPS',
  COMMUNITY_EXERCISE = 'COMMUNITY_EXERCISE',
  COMMUNITY_STREAK = 'COMMUNITY_STREAK',

  // Achievement quests
  ACHIEVEMENT_UNLOCK = 'ACHIEVEMENT_UNLOCK',
  ACHIEVEMENT_COLLECTION = 'ACHIEVEMENT_COLLECTION',
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';

@Entity('QUEST')
export class QuestEntity {
  @PrimaryGeneratedColumn()
  QID: number;

  @Column()
  QUEST_IMG: string;

  @Column()
  QUEST_TITLE: string;

  @Column({
    type: 'enum',
    enum: QUEST_TYPE,
  })
  QUEST_TYPE: QUEST_TYPE;

  @Column('float')
  QUEST_DAY_DURATION: number;

  @Column()
  DESCRIPTION: string;

  @Column()
  EXP_REWARDS: number;

  @Column()
  GEM_REWARDS: number;

  @Column({ type: 'float', nullable: true })
  RQ_TARGET_DISTANCE: number;

  @Column({ nullable: true })
  RQ_SUCCESS_HABIT: number;

  @Column({ nullable: true })
  RQ_READ_AMOUT: number;

  @Column({ type: 'time', nullable: true })
  RQ_ACTIVITY_TARGET_TIME: string;

  // @BeforeInsert()
  // @BeforeUpdate()
  // formatTime() {
  //   if (this.RQ_ACTIVITY_TARGET_TIME) {
  //     // Convert to HH:mm:ss format for PostgreSQL time type
  //     const date = new Date(this.RQ_ACTIVITY_TARGET_TIME);
  //     const timeString = date.toTimeString().split(' ')[0];
  //     this.RQ_ACTIVITY_TARGET_TIME = timeString as any;
  //   }
  // }
}
