import { ShopItem } from '@/.typeorm/entities/shop-items.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryColumn,
} from 'typeorm';

@Entity('MYSTERY_BOX')
export class MysteryBox {
  @PrimaryColumn({ name: 'BOX_NAME' })
  BOX_NAME: string;

  @Column({ name: 'BOX_DESCRIPTION', nullable: true })
  BOX_DESCRIPTION: string;

  @Column({ name: 'PRICE_GEM', nullable: true, default: 30 })
  PRICE_GEM: number;

  @Column({ name: 'PRICE_EXP', nullable: true })
  PRICE_EXP: number;

  @Column({ name: 'IMAGE_URL', nullable: true })
  IMAGE_URL: string;

  @Column({ name: 'IS_ACTIVE', default: true })
  IS_ACTIVE: boolean;

  @ManyToMany(() => ShopItem, (shopItem) => shopItem.mysteryBoxes)
  @JoinTable({
    name: 'MYSTERY_BOX_ITEMS',
    joinColumn: {
      name: 'BOX_NAME',
      referencedColumnName: 'BOX_NAME',
    },
    inverseJoinColumn: {
      name: 'ITEM_ID',
      referencedColumnName: 'ITEM_ID',
    },
  })
  shopItems: ShopItem[];
}
