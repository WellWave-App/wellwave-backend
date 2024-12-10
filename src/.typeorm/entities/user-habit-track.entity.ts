import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { HabitEntity, MOOD_FEEDBACK } from './habit.entity';
import { UserEntity } from 'src/.typeorm/entities/users.entity';

@Entity('USER_HABIT_TRACK')
export class UserHabitTrackEntity {
  @PrimaryColumn()
  UID: number;

  @PrimaryColumn()
  HID: number;

  @PrimaryColumn()
  TRACK_DATE: Date;

  @Column()
  START_DATE: Date;

  @Column()
  END_DATE: Date;

  @Column()
  STATUS: boolean;

  @Column('float')
  TIME_USED: number;

  @Column({ type: 'float', nullable: true })
  USER_TIME_GOAL: number;

  @Column()
  USER_DAYS_GOAL: number;

  @Column({ type: 'time', nullable: true })
  REMINDER_NOTI_TIME: Date;

  @Column({
    type: 'enum',
    enum: MOOD_FEEDBACK,
    nullable: true,
  })
  MOOD_FEEDBACK: MOOD_FEEDBACK;

  @Column()
  STREAK_COUNT: number;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'UID' })
  user: UserEntity;

  @ManyToOne(() => HabitEntity)
  @JoinColumn({ name: 'HID' })
  habit: HabitEntity;
}
