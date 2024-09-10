import { LogEntity } from 'src/typeorm/entities/log.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ type: 'date' })
  birth_date: Date;

  @Column()
  gender: boolean;

  @Column()
  height: number;

  @Column({ default: 0 })
  gem: number;

  @Column({ default: 0 })
  exp: number;

  @Column({ nullable: true })
  weight_goal: number;

  @Column({ default: new Date() })
  createAt: Date;

  @Column({ nullable: true })
  reminder_noti_time?: string;

  @OneToMany(() => LogEntity, (log) => log.user)
  logs: LogEntity[];
}
