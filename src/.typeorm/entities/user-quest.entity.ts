import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from 'src/.typeorm/entities/users.entity';
import { QuestEntity } from 'src/.typeorm/entities/quest.entity';

@Entity('USER_QUEST')
export class UserQuestEntity {
  @PrimaryColumn()
  QID: number;

  @PrimaryColumn()
  UID: number;

  @Column()
  START_DATE: Date;

  @Column()
  END_DATE: Date;

  @Column()
  STATUS: boolean;

  @ManyToOne(() => QuestEntity)
  @JoinColumn({ name: 'QID' })
  quest: QuestEntity;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'UID' })
  user: UserEntity;
}
