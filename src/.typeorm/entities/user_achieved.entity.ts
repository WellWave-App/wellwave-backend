import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('USER_ACHIEVED')
export class UserAchieved {
  @PrimaryColumn('number', { name: 'ICON_URL' })
  UID: string;

  @PrimaryColumn('uuid', { name: 'ICON_URL' })
  ACH_ID: string;

  @Column('int', { name: 'ICON_URL', nullable: true })
  CURRENT_LEVEL: number;

  @Column('float', { name: 'ICON_URL', nullable: true })
  PROGRESS_VALUE: number;

  @Column('date', { name: 'ICON_URL', nullable: true })
  ACHIEVED_DATE?: Date;

  @CreateDateColumn({ name: 'createdAt', type: 'date' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'date' })
  updatedAt: Date;
}
