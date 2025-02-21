import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { LeagueType } from '../../leagues/enum/lagues.enum';
import { User } from '@/.typeorm/entities/users.entity';

@Entity('USER_LEADERBOARD')
export class UserLeaderboard {
  @PrimaryColumn('number', { name: 'UID' })
  UID: number;

  @Column('enum', {
    name: 'CURRENT_LEAGUE',
    default: LeagueType.NONE,
    enum: LeagueType,
  })
  CURRENT_LEAGUE: LeagueType;

  @Column('int', { name: 'CURRENT_RANK', nullable: true })
  CURRENT_RANK: number;

  @Column('int', { name: 'CURRENT_EXP', default: 0 })
  CURRENT_EXP: number; // reset every date 1, 16

  @Column('enum', {
    name: 'PREVIOUS_LEAGUE',
    default: LeagueType.NONE,
    enum: LeagueType,
  })
  PREVIOUS_LEAGUE: LeagueType;

  @Column('int', { name: 'PREVIOUS_RANK', nullable: true })
  PREVIOUS_RANK: number;

  @Column('int', { name: 'GROUP_NUMBER', nullable: true })
  GROUP_NUMBER: number;

  @OneToOne(() => User, (u) => u.league, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'UID' })
  user: User;
}
