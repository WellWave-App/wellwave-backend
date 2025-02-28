import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsEnum,
  IsString,
} from 'class-validator';
import { ShopItemType } from '../enum/item-type.enum';
import { Rarity } from '../enum/rarity.enum';
export class UpdateShopItemDto {
  @IsOptional()
  @IsEnum(ShopItemType)
  ITEM_TYPE?: ShopItemType;

  @IsOptional()
  @IsString()
  ITEM_NAME?: string;

  @IsOptional()
  @IsString()
  DESCRIPTION?: string;

  @IsOptional()
  @IsNumber()
  PRICE_GEM?: number;

  @IsOptional()
  @IsNumber()
  PRICE_EXP?: number;

  @IsOptional()
  @IsString()
  IMAGE_URL?: string;

  @IsOptional()
  @IsEnum(Rarity)
  RARITY?: Rarity;

  @IsOptional()
  @IsBoolean()
  IS_ACTIVE?: boolean;

  // Optional file for image upload
  @IsOptional()
  file?: Express.Multer.File;
}

export class UpdateExpBoosterDto extends UpdateShopItemDto {
  @IsOptional()
  @IsNumber()
  BOOST_MULTIPLIER?: number;

  @IsOptional()
  @IsNumber()
  BOOST_DAYS?: number;
}

export class UpdateGemExchangeDto extends UpdateShopItemDto {
  @IsOptional()
  @IsNumber()
  GEM_REWARD?: number;
}
