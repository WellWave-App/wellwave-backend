import { User } from '@/.typeorm/entities/users.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('PRIVACY_SETTING')
export class PrivateSetting {
  @PrimaryColumn()
  USER_ID: number;

  @OneToOne(() => User, (user) => user.privacy)
  @JoinColumn({ name: 'USER_ID' })
  user: User;

  @Column({ default: true })
  SHOW_GEM: boolean;

  @Column({ default: true })
  SHOW_EXP: boolean;

  @Column({ default: true })
  SHOW_LEAGUE: boolean;

  @Column({ default: true })
  SHOW_STEPS: boolean;

  @Column({ default: true })
  SHOW_SLEEP_HOUR: boolean;
}
