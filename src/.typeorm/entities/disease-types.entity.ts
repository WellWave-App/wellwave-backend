import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Timestamp,
  UpdateDateColumn,
} from 'typeorm';

@Entity('DISEASE_TYPES')
export class DiseaseTypes {
  @PrimaryGeneratedColumn({ type: 'int' })
  DISEASE_ID: number; //PK

  @Column({ type: 'varchar' })
  TH_NAME: string; // 'ความดันโลหิตสูง', 'เบาหวาน', 'อ้วน', 'ไขมันในเลือดสูง'

  @Column({ type: 'varchar' })
  ENG_NAME: string; // 'ความดันโลหิตสูง', 'เบาหวาน', 'อ้วน', 'ไขมันในเลือดสูง'

  @Column({ type: 'text', nullable: true })
  DESCRIPTION?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
