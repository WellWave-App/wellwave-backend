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
import { Transform } from 'class-transformer';

// Helper function for handling JSON strings
const parseJSON = (value: any, defaultValue: any = {}) => {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return defaultValue;
    }
  }
  return value || defaultValue;
};

// Helper function for handling empty values
const handleEmpty = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  return value;
};

// Helper function for handling numbers
const parseNumber = (value: any) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

export class CreateShopItemDto {
  @IsNotEmpty()
  @IsEnum(ShopItemType)
  ITEM_TYPE: ShopItemType;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => handleEmpty(value))
  ITEM_NAME: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => handleEmpty(value))
  DESCRIPTION: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  PRICE_GEM: number;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  PRICE_EXP: number;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => handleEmpty(value))
  IMAGE_URL: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  RARITY: number;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => handleEmpty(value))
  IS_ACTIVE: boolean;

  @IsOptional()
  file: Express.Multer.File;

  //exp booster proerties
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => parseNumber(value))
  BOOST_MULTIPLIER: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  BOOST_DAYS: number;

  //gem exchange properties
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  GEM_REWARD: number;
}

export class CreateExpBoosterDto extends CreateShopItemDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  BOOST_MULTIPLIER: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  BOOST_DAYS: number;
}

export class CreateGemExchangeDto extends CreateShopItemDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseNumber(value))
  GEM_REWARD: number;
}
