import { Entity, PrimaryColumn, OneToOne, JoinColumn, Column } from "typeorm";
import { ShopItem } from "./shop-items.entity";

@Entity('GEM_EXCHANGES')
export class GemExchange {
  @PrimaryColumn({ name: 'ITEM_ID' })
  ITEM_ID: number;

  @OneToOne(() => ShopItem, shopItem => shopItem.gemExchange)
  @JoinColumn({ name: 'ITEM_ID' })
  item: ShopItem;

  @Column({ name: 'GEM_REWARD'})
  GEM_REWARD: number;
}