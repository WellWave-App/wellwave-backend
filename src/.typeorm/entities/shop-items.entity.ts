import { ShopItemType } from '@/shop/enum/item-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserItems } from './user-items.entity';
import { ExpBooster } from './exp-booster.entity';
import { GemExchange } from './gem-exhange.entity';
import { Rarity } from '@/shop/enum/rarity.enum';
import { MysteryBox } from './mystery-box.entity';

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

  @Column({ name: 'ITEM_NAME', length: 100, nullable: true })
  ITEM_NAME: string;

  @Column({ name: 'DESCRIPTION', length: 255, nullable: true })
  DESCRIPTION: string;

  @Column({ name: 'PRICE_GEM', nullable: true, default: 0 })
  PRICE_GEM: number;

  @Column({ name: 'PRICE_EXP', nullable: true, default: 0 })
  PRICE_EXP: number;

  @Column({ name: 'IMAGE_URL', length: 255, nullable: true })
  IMAGE_URL: string;

  @Column({
    name: 'RARITY',
    type: 'float',
  })
  RARITY: number;

  @Column({ name: 'IS_ACTIVE', default: true })
  IS_ACTIVE: boolean;

  @OneToMany(() => UserItems, (userItem) => userItem.item)
  userItems: UserItems[];

  @OneToOne(() => ExpBooster, (expBooster) => expBooster.item, { eager: true })
  expBooster: ExpBooster;

  @OneToOne(() => GemExchange, (gemExchange) => gemExchange.item, {
    eager: true,
  })
  gemExchange: GemExchange;

  @ManyToMany(() => MysteryBox, (mysteryBox) => mysteryBox.shopItems)
  @JoinTable({
    name: 'MYSTERY_BOX_ITEMS',
    joinColumn: {
      name: 'ITEM_ID',
      referencedColumnName: 'ITEM_ID',
    },
    inverseJoinColumn: {
      name: 'BOX_NAME',
      referencedColumnName: 'BOX_NAME',
    },
  })
  mysteryBoxes: MysteryBox[];
}
