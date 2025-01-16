import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('HABIT_CATEGORIES')
export class HabitCategories {
  @PrimaryGeneratedColumn({ type: 'int', name: 'CATEGORY_ID' })
  CATEGORY_ID: number;

  @Column({ type: 'varchar', name: 'CATEGORY_NAME' })
  CATEGORY_NAME: string;

  @Column({ type: 'varchar', name: 'CATEGORY_TYPE' })
  CATEGORY_TYPE: string; // 'exercise', 'diet', 'sleep'

  @Column({ type: 'text', name: 'DESCRIPTION' })
  DESCRIPTION: string;

  // Self-referencing ManyToOne for parent category
  @ManyToOne(() => HabitCategories, (category) => category.SUB_CATEGORIES)
  @JoinColumn({ name: 'PARENT_CATEGORY_ID' }) // Refers to the parent category
  PARENT_CATEGORY: HabitCategories;

  // Self-referencing OneToMany for subcategories
  @OneToMany(() => HabitCategories, (category) => category.PARENT_CATEGORY)
  SUB_CATEGORIES: HabitCategories[];
}
