import { User } from '@/.typeorm/entities/users.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ShopItem } from './shop-items.entity';

@Entity('USER_ITEMS')
export class UserItems {
  @PrimaryGeneratedColumn({ name: 'USER_ITEM_ID' })
  USER_ITEM_ID: number;

  @Column({ name: 'UID', primary: true })
  UID: number;
  @ManyToOne(() => User, (user) => user.userItems)
  @JoinColumn({ name: 'UID' })
  user: User;

  @Column({ name: 'ITEM_ID', primary: true })
  ITEM_ID: number;
  @ManyToOne(() => ShopItem, (shopItem) => shopItem.userItems)
  @JoinColumn({ name: 'ITEM_ID' })
  item: ShopItem;

  @Column({ name: 'PURCHASE_DATE', primary: true, type: 'timestamp' })
  PURCHASE_DATE: Date;

  @Column({ name: 'EXPIRE_DATE', nullable: true })
  EXPIRE_DATE: Date;

  @Column({ name: 'IS_ACTIVE', default: true })
  IS_ACTIVE: boolean;
}
