import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('USER_ACHIEVED')
export class UserAchieved {
  @PrimaryColumn('int', { name: 'UID' })
  UID: number;

  @PrimaryColumn('uuid', { name: 'ACH_ID' })
  ACH_ID: string;

  @Column('int', { name: 'CURRENT_LEVEL', nullable: true })
  CURRENT_LEVEL: number;

  @Column('float', { name: 'PROGRESS_VALUE', nullable: true })
  PROGRESS_VALUE: number;
  
  @Column('date', { name: 'ACHIEVED_DATE', nullable: true })
  ACHIEVED_DATE?: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'date' })
  updatedAt: Date;
}
