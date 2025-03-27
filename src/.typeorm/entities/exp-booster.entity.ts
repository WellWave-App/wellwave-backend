import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from 'typeorm';
import { ShopItem } from './shop-items.entity';

@Entity('EXP_BOOSTERS')
export class ExpBooster {
  @PrimaryColumn({ name: 'ITEM_ID' })
  ITEM_ID: number;

  @OneToOne(() => ShopItem, (shopItem) => shopItem.expBooster)
  @JoinColumn({ name: 'ITEM_ID' })
  item: ShopItem;

  @Column({ name: 'BOOST_MULTIPLIER', type: 'float' })
  BOOST_MULTIPLIER: number;

  @Column({ name: 'BOOST_DAYS' })
  BOOST_DAYS: number;
}
