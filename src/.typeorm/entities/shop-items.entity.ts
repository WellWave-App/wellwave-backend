import { ShopItemType } from '@/shop/enum/item-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserItems } from './user-items.entity';
import { ExpBooster } from './exp-booster.entity';
import { GemExchange } from './gem-exhange.entity';
import { Rarity } from '@/shop/enum/rarity.enum';

@Entity('SHOP_ITEMS')
export class ShopItem {
  @PrimaryGeneratedColumn({ name: 'ITEM_ID' })
  ITEM_ID: number;

  @Column({
    name: 'ITEM_TYPE',
    type: 'enum',
    enum: ShopItemType,
  })
  ITEM_TYPE: ShopItemType;

  @Column({ name: 'ITEM_NAME', length: 100 })
  ITEM_NAME: string;

  @Column({ name: 'DESCRIPTION', length: 255 })
  DESCRIPTION: string;

  @Column({ name: 'PRICE_GEM', nullable: true })
  PRICE_GEM: number;

  @Column({ name: 'PRICE_EXP', nullable: true })
  PRICE_EXP: number;

  @Column({ name: 'IMAGE_URL', length: 255 })
  IMAGE_URL: string;

  @Column({
    name: 'RARITY',
    enum: Rarity,
    type: 'enum',
    // default: Rarity.COMMON,
  })
  RARITY: Rarity;

  @Column({ name: 'IS_ACTIVE', default: true })
  IS_ACTIVE: boolean;

  @OneToMany(() => UserItems, (userItem) => userItem.item)
  userItems: UserItems[];

  @OneToOne(() => ExpBooster, (expBooster) => expBooster.item)
  expBooster: ExpBooster;

  @OneToOne(() => GemExchange, (gemExchange) => gemExchange.item)
  gemExchange: GemExchange;
}
