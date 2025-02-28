import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ShopItemType } from '../enum/item-type.enum';
import { Rarity } from '../enum/rarity.enum';

export class CreateShopItemDto {
  @IsNotEmpty()
  @IsEnum(ShopItemType)
  ITEM_TYPE: ShopItemType;

  @IsNotEmpty()
  @IsString()
  ITEM_NAME: string;

  @IsString()
  @IsNotEmpty()
  DESCRIPTION: string;

  @IsOptional()
  @IsNumber()
  PRICE_GEM: number;

  @IsNumber()
  @IsOptional()
  PRICE_EXP: number;

  @IsString()
  @IsOptional()
  IMAGE_URL: string;

  @IsString()
  @IsOptional()
  @IsEnum(Rarity)
  RARITY: Rarity;

  @IsOptional()
  @IsBoolean()
  IS_ACTIVE: boolean;

  @IsOptional()
  file: Express.Multer.File;
}

export class CreateExpBoosterDto extends CreateShopItemDto {
  @IsNumber()
  BOOST_MULTIPLIER: number;

  @IsNumber()
  BOOST_DAYS: number;
}

export class CreateGemExchangeDto extends CreateShopItemDto {
  @IsNumber()
  GEM_REWARD: number;
}
