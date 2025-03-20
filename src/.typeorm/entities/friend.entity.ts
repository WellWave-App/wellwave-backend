import { User } from '@/.typeorm/entities/users.entity';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';


@Entity('FRIENDS')
export class Friend {
  @PrimaryColumn()
  USER1_ID: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER1_ID' })
  user1: User;

  @PrimaryColumn()
  USER2_ID: number;
  @ManyToOne(() => User)
  @JoinColumn({ name: 'USER2_ID' })
  user2: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'REQUESTED_BY_ID' })
  REQUESTED_BY: User;

  @Column()
  REQUESTED_BY_ID: number;
}
