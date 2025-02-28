import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { GemExchange } from '@/.typeorm/entities/gem-exhange.entity';
import { ExpBooster } from '@/.typeorm/entities/exp-booster.entity';
import { ShopItem } from '@/.typeorm/entities/shop-items.entity';
import { UserItems } from '@/.typeorm/entities/user-items.entity';
import {
  CreateExpBoosterDto,
  CreateGemExchangeDto,
  CreateShopItemDto,
} from './dto/create-items.dto';
import { DataSource } from 'typeorm';
import { ImageService } from '@/image/image.service';
import { Rarity } from './enum/rarity.enum';
import { ShopItemType } from './enum/item-type.enum';
import { query } from '../achievement/dto/userAchieved/all-query.dto';
import { PaginatedResponse } from '@/response/response.interface';
import {
  UpdateShopItemDto,
  UpdateExpBoosterDto,
  UpdateGemExchangeDto,
} from './dto/update-items.dto';

@Injectable()
export class ShopService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ShopItem)
    private shopItemRepository: Repository<ShopItem>,
    @InjectRepository(UserItems)
    private userItemsRepository: Repository<UserItems>,
    @InjectRepository(ExpBooster)
    private expBoosterRepository: Repository<ExpBooster>,
    @InjectRepository(GemExchange)
    private gemExchangeRepository: Repository<GemExchange>,
    private imageService: ImageService,
  ) {}

  async createItems(dto: CreateShopItemDto, file: Express.Multer.File) {
    try {
      if (file) {
        dto.IMAGE_URL = this.imageService.getImageUrl(file.filename);
      }

      return this.dataSource.transaction(async (manager) => {
        const shopItem = new ShopItem();
        shopItem.ITEM_TYPE = dto.ITEM_TYPE;
        shopItem.ITEM_NAME = dto.ITEM_NAME;
        shopItem.DESCRIPTION = dto.DESCRIPTION;
        shopItem.PRICE_GEM = dto.PRICE_GEM;
        shopItem.PRICE_EXP = dto.PRICE_EXP;
        shopItem.IMAGE_URL = dto.IMAGE_URL || null;
        shopItem.RARITY = dto.RARITY || Rarity.COMMON;
        shopItem.IS_ACTIVE = dto.IS_ACTIVE !== undefined ? dto.IS_ACTIVE : true;

        const savedItem = await manager.save(shopItem);

        switch (dto.ITEM_TYPE) {
          case ShopItemType.EXP_BOOST: {
            // Validate that we have the necessary data for an EXP booster
            if (
              !(dto as CreateExpBoosterDto).BOOST_MULTIPLIER ||
              !(dto as CreateExpBoosterDto).BOOST_DAYS
            ) {
              throw new BadRequestException(
                'EXP boosters require BOOST_MULTIPLIER and BOOST_DAYS values',
              );
            }

            const expBoosterDto = dto as CreateExpBoosterDto;
            const expBooster = new ExpBooster();
            expBooster.ITEM_ID = savedItem.ITEM_ID;
            expBooster.BOOST_MULTIPLIER = expBoosterDto.BOOST_MULTIPLIER;
            expBooster.BOOST_DAYS = expBoosterDto.BOOST_DAYS;

            await manager.save(expBooster);
            break;
          }

          case ShopItemType.GEM_EXCHANGE: {
            // Validate that we have the necessary data for a gem exchange
            if (!(dto as CreateGemExchangeDto).GEM_REWARD) {
              throw new BadRequestException(
                'Gem exchange items require a GEM_REWARD value',
              );
            }

            const gemExchangeDto = dto as CreateGemExchangeDto;
            const gemExchange = new GemExchange();
            gemExchange.ITEM_ID = savedItem.ITEM_ID;
            gemExchange.GEM_REWARD = gemExchangeDto.GEM_REWARD;

            await manager.save(gemExchange);
            break;
          }
          default:
            throw new BadRequestException(
              `Unknown item type: ${dto.ITEM_TYPE}`,
            );
        }

        const relation =
          dto.ITEM_TYPE === ShopItemType.EXP_BOOST
            ? 'expBooster'
            : 'gemExchange';

        return manager.findOne(ShopItem, {
          where: { ITEM_ID: savedItem.ITEM_ID },
          relations: [relation],
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async getAllItems(query: {
    name?: string;
    type?: ShopItemType;
    rarity?: Rarity;
    page?: number;
    limit?: number;
    pagination?: boolean;
  }) {
    const { name, type, rarity, page = 1, limit = 10, pagination } = query;

    const queryBuilder = this.shopItemRepository
      .createQueryBuilder('shopItem')
      .leftJoinAndSelect('shopItem.expBooster', 'expBooster')
      .leftJoinAndSelect('shopItem.gemExchange', 'gemExchange');

    if (name) {
      queryBuilder.where('shopItem.ITEM_NAME LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (pagination) {
      queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    if (rarity) {
      queryBuilder.andWhere('shopItem.RARITY = :rarity', { rarity });
    }

    if (type) {
      queryBuilder.andWhere('shopItem.ITEM_TYPE = :type', { type });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      meta: {
        total: total,
        ...(pagination && {
          page: page,
          limit: limit,
          totalPages: Math.ceil(total / limit),
        }),
      },
    };
  }

  async findOne(id: number) {
    try {
      return await this.shopItemRepository.findOne({
        where: {
          ITEM_ID: id,
        },
        relations: ['expBooster', 'gemExchange'],
      });
    } catch (error) {
      throw new NotFoundException(`Item with ID ${id} not found`);
    }
  }

  async update(id: number, dto: CreateShopItemDto, file?: Express.Multer.File) {
    try {
      return this.dataSource.transaction(async (manager) => {
        // Find the existing item with relations
        const existingItem = await manager.findOne(ShopItem, {
          where: { ITEM_ID: id },
          relations: ['expBooster', 'gemExchange'],
        });

        if (!existingItem) {
          throw new NotFoundException(`Item with ID ${id} not found`);
        }

        // Handle image update if a new file is provided
        if (file) {
          // Delete old image if exists
          if (existingItem.IMAGE_URL) {
            await this.imageService.deleteImageByUrl(existingItem.IMAGE_URL);
          }
          dto.IMAGE_URL = this.imageService.getImageUrl(file.filename);
        }

        // Update base item properties
        const updateFields = [
          'ITEM_NAME',
          'DESCRIPTION',
          'PRICE_GEM',
          'PRICE_EXP',
          'RARITY',
          'IS_ACTIVE',
        ];

        // Only update fields that are provided in the DTO
        for (const field of updateFields) {
          if (dto[field] !== undefined) {
            existingItem[field] = dto[field];
          }
        }

        // Update IMAGE_URL only if a new one is provided
        if (dto.IMAGE_URL) {
          existingItem.IMAGE_URL = dto.IMAGE_URL;
        }

        // Save updated base item
        await manager.save(existingItem);

        // Handle type-specific updates
        switch (existingItem.ITEM_TYPE) {
          case ShopItemType.EXP_BOOST: {
            // First, correct the error in the code - check for BOOST_MULTIPLIER and BOOST_DAYS
            const expBossterDto = dto as CreateExpBoosterDto;

            if (
              expBossterDto.BOOST_MULTIPLIER !== undefined &&
              expBossterDto.BOOST_DAYS !== undefined
            ) {
              // If expBooster relation doesn't exist, create it
              if (!existingItem.expBooster) {
                const expBooster = new ExpBooster();
                expBooster.ITEM_ID = existingItem.ITEM_ID;
                expBooster.BOOST_MULTIPLIER = expBossterDto.BOOST_MULTIPLIER;
                expBooster.BOOST_DAYS = expBossterDto.BOOST_DAYS;
                await manager.save(expBooster);
              } else {
                // Update existing expBooster
                existingItem.expBooster.BOOST_MULTIPLIER =
                  expBossterDto.BOOST_MULTIPLIER;
                existingItem.expBooster.BOOST_DAYS = expBossterDto.BOOST_DAYS;
                await manager.save(existingItem.expBooster);
              }
            }
            break;
          }
          case ShopItemType.GEM_EXCHANGE: {
            // Check if the update includes GemExchange fields
            const gemExchangeDto = dto as CreateGemExchangeDto;
            if (gemExchangeDto.GEM_REWARD !== undefined) {
              // If gemExchange relation doesn't exist, create it
              if (!existingItem.gemExchange) {
                const gemExchange = new GemExchange();
                gemExchange.ITEM_ID = existingItem.ITEM_ID;
                gemExchange.GEM_REWARD = gemExchangeDto.GEM_REWARD;
                await manager.save(gemExchange);
              } else {
                // Update existing gemExchange
                existingItem.gemExchange.GEM_REWARD = gemExchangeDto.GEM_REWARD;
                await manager.save(existingItem.gemExchange);
              }
            }
            break;
          }
          case ShopItemType.MYSTERY_BOX: {
            // No additional properties to update for mystery boxes
            break;
          }
          default:
            throw new BadRequestException(
              `Unknown item type: ${existingItem.ITEM_TYPE}`,
            );
        }

        // Return the updated item with relations
        return manager.findOne(ShopItem, {
          where: { ITEM_ID: existingItem.ITEM_ID },
          relations: ['expBooster', 'gemExchange'],
        });
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to update item: ${error.message}`,
      );
    }
  }
}
