import { User } from '@/.typeorm/entities/users.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne as OneToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

// otp.entity.ts
@Entity('OTP')
export class OTP {
  @PrimaryColumn()
  UID: number;

  @Column()
  OTP: string;

  @Column()
  EXPIRES_AT: Date;

  @Column({ default: false })
  IS_USED: boolean;

  @OneToOne(() => User)
  @JoinColumn({ name: 'UID' })
  user: User;
}
