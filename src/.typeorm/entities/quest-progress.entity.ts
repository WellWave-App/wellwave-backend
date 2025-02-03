import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserQuests } from './user-quests.entity';

@Entity('QUEST_PROGRESS')
export class QuestProgress {
  @PrimaryGeneratedColumn({ name: 'PROGRESS_ID', type: 'int' })
  PROGRESS_ID: number;

  @Column({ name: 'QID', type: 'int' })
  QID: number;

  @Column({ name: 'UID', type: 'int' })
  UID: number;

  @Column({ name: 'TRACK_DATE', type: 'date' })
  TRACK_DATE: Date;

  @Column({ name: 'VALUE_COMPLETED', type: 'float', default: 0 })
  VALUE_COMPLETED: number;  // Generic progress field (minutes/distance/count)

  @CreateDateColumn()
  CREATED_AT: Date;

  @ManyToOne(() => UserQuests)
  @JoinColumn([
    { name: 'QID', referencedColumnName: 'QID' },
    { name: 'UID', referencedColumnName: 'UID' }
  ])
  UserQuest: UserQuests;
}