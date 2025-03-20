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
import { MysteryBox } from '@/.typeorm/entities/mystery-box.entity';
import { RewardService } from '../users/services/reward.service';
import { DateService } from '@/helpers/date/date.services';

export interface ShopItemWithCustomRarity extends ShopItem {
  RARITY_WEIGHT: number; // Custom rarity weight for each item
}

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
    @InjectRepository(MysteryBox)
    private mysteryBoxRepository: Repository<MysteryBox>,
    private imageService: ImageService,
    private rewardService: RewardService,
    private dateService: DateService,
  ) {}

  async remove(id: number) {
    try {
      return this.dataSource.transaction(async (manager) => {
        // Find the item with relations to ensure it exists
        const item = await manager.findOne(ShopItem, {
          where: { ITEM_ID: id },
          relations: ['expBooster', 'gemExchange', 'userItems'],
        });

        if (!item) {
          throw new NotFoundException(`Item with ID ${id} not found`);
        }

        // Check if the item is being used by any users
        if (item.userItems && item.userItems.length > 0) {
          throw new BadRequestException(
            `Cannot delete item with ID ${id} because it's currently in use by users`,
          );
        }

        // Delete associated records based on item type
        if (item.ITEM_TYPE === ShopItemType.EXP_BOOST && item.expBooster) {
          await manager.delete(ExpBooster, { ITEM_ID: id });
        } else if (
          item.ITEM_TYPE === ShopItemType.GEM_EXCHANGE &&
          item.gemExchange
        ) {
          await manager.delete(GemExchange, { ITEM_ID: id });
        }

        // Delete the item from mystery boxes if it's part of any
        // First, we need to find all mystery boxes that contain this item
        const mysteryBoxes = await manager
          .createQueryBuilder()
          .select('mbi.BOX_NAME')
          .from('MYSTERY_BOX_ITEMS', 'mbi')
          .where('mbi.ITEM_ID = :itemId', { itemId: id })
          .getRawMany();

        // Remove the item from each mystery box
        for (const box of mysteryBoxes) {
          await manager
            .createQueryBuilder()
            .delete()
            .from('MYSTERY_BOX_ITEMS')
            .where('BOX_NAME = :boxName AND ITEM_ID = :itemId', {
              boxName: box.BOX_NAME,
              itemId: id,
            })
            .execute();
        }

        // Delete the image if it exists
        if (item.IMAGE_URL) {
          try {
            await this.imageService.deleteImageByUrl(item.IMAGE_URL);
          } catch (error) {
            // Log error but continue with deletion
            console.error(`Failed to delete image: ${error.message}`);
          }
        }

        // Finally, delete the shop item
        await manager.delete(ShopItem, { ITEM_ID: id });

        return { message: `Item with ID ${id} has been successfully deleted` };
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to delete item: ${error.message}`,
      );
    }
  }

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
        shopItem.RARITY = dto.RARITY;
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
    page?: number;
    limit?: number;
    pagination?: boolean;
    filter?: 'all' | 'inBox' | 'notInBox';
  }) {
    const {
      name,
      type,
      page = 1,
      limit = 10,
      pagination = false,
      filter = 'all',
    } = query;

    const queryBuilder = this.shopItemRepository
      .createQueryBuilder('shopItem')
      .leftJoinAndSelect('shopItem.expBooster', 'expBooster')
      .leftJoinAndSelect('shopItem.gemExchange', 'gemExchange')
      .leftJoinAndSelect('shopItem.mysteryBoxes', 'mysteryBoxes');

    if (name) {
      queryBuilder.where('shopItem.ITEM_NAME LIKE :name', {
        name: `%${name}%`,
      });
    }

    if (pagination) {
      queryBuilder.skip((page - 1) * limit).limit(limit);
    }

    if (type) {
      queryBuilder.andWhere('shopItem.ITEM_TYPE = :type', { type });
    }

    // Handle the filter properly
    if (filter === 'inBox') {
      queryBuilder.andWhere('mysteryBoxes.BOX_NAME IS NOT NULL');
    } else if (filter === 'notInBox') {
      queryBuilder.andWhere('mysteryBoxes.BOX_NAME IS NULL');
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

  async createMysteryBox(dto: {
    BOX_NAME: string;
    BOX_DESCRIPTION?: string;
    PRICE_GEM?: number;
    PRICE_EXP?: number;
    IMAGE_URL?: string;
    IS_ACTIVE?: boolean;
  }) {
    try {
      const exist = await this.mysteryBoxRepository.findOne({
        where: {
          BOX_NAME: dto.BOX_NAME,
        },
      });

      if (exist !== null) {
        throw new BadRequestException(
          `Mystery box with name ${dto.BOX_NAME} already exists`,
        );
      }

      const instance = this.mysteryBoxRepository.create({
        BOX_NAME: dto.BOX_NAME,
        BOX_DESCRIPTION: dto.BOX_DESCRIPTION || '',
        PRICE_GEM: dto.PRICE_GEM || 30,
        PRICE_EXP: dto.PRICE_EXP || 0,
        IMAGE_URL: dto.IMAGE_URL || null,
        IS_ACTIVE: dto.IS_ACTIVE !== undefined ? dto.IS_ACTIVE : true,
        // shopItems: [],
      });

      return await this.mysteryBoxRepository.save(instance);
    } catch (error) {
      throw new InternalServerErrorException(`${error.message}`);
    }
  }

  async createAndAddToMysteryBox(dto: CreateShopItemDto, boxName: string) {
    try {
      // First find the box
      let box = await this.mysteryBoxRepository.findOne({
        where: {
          BOX_NAME: boxName,
        },
        relations: ['shopItems'],
      });

      // If box doesn't exist, create it
      if (box === null) {
        box = await this.createMysteryBox({ BOX_NAME: boxName });
        // After creation, fetch it again with relations
        box = await this.mysteryBoxRepository.findOne({
          where: {
            BOX_NAME: boxName,
          },
          relations: ['shopItems'],
        });

        // Initialize shopItems array if it's undefined
        if (!box.shopItems) {
          box.shopItems = [];
        }
      }

      // Create the item
      const item = await this.createItems(dto, null);

      // Use the query builder to insert directly into the join table
      await this.dataSource
        .createQueryBuilder()
        .insert()
        .into('MYSTERY_BOX_ITEMS')
        .values({
          BOX_NAME: boxName,
          ITEM_ID: item.ITEM_ID,
        })
        .execute();

      // Return the updated box with its items
      return await this.mysteryBoxRepository.findOne({
        where: {
          BOX_NAME: boxName,
        },
        relations: ['shopItems'],
      });
    } catch (error) {
      console.error('Error in createAndAddToMysteryBox:', error);
      throw new InternalServerErrorException(
        `Error adding item to mystery box: ${error.message}`,
      );
    }
  }

  async getRandomItem(boxName: string) {
    try {
      const box = await this.mysteryBoxRepository.findOne({
        where: {
          BOX_NAME: boxName,
        },
        relations: [
          'shopItems',
          'shopItems.expBooster',
          'shopItems.gemExchange',
        ],
      });

      if (!box) {
        throw new NotFoundException(`Mystery box ${boxName} not found`);
      }
      const total = box.shopItems.reduce((sum, item) => sum + item.RARITY, 0);

      const randomNum = Math.random() * total;

      let cumulativeWeight = 0;
      for (const item of box.shopItems) {
        cumulativeWeight += item.RARITY;
        if (randomNum <= cumulativeWeight) {
          return item;
        }
      }

      return box.shopItems[0];
    } catch (error) {
      throw new InternalServerErrorException(
        `${error.status}: ${error.message}`,
      );
    }
  }

  async randomMystery(uid: number, boxName: string) {
    /**
     * todo: flow
     * 1. user pay with box gem price
     * 2. get random item from box
     * 3. add item to user inventory
     * 4. return item to user
     *
     * todo: expected response
     * {
     *  what item user get
     * }
     */
    const today = new Date(this.dateService.getCurrentDate().timestamp);
    try {
      const box = await this.mysteryBoxRepository.findOne({
        where: {
          BOX_NAME: boxName,
        },
        relations: [
          'shopItems',
          'shopItems.expBooster',
          'shopItems.gemExchange',
        ],
      });

      const pay = await this.rewardService.pay(uid, {
        gem: box.PRICE_GEM,
      });

      if (pay.status !== 200) {
        throw new BadRequestException(pay.message);
      }

      const item = await this.getRandomItem(boxName);

      if (!item) {
        throw new NotFoundException('No items found in the mystery box');
      }

      const userItem = this.userItemsRepository.create({
        UID: uid,
        ITEM_ID: item.ITEM_ID,
        PURCHASE_DATE: today,
        EXPIRE_DATE: null,
        IS_ACTIVE: false,
      });

      if (item.ITEM_TYPE === ShopItemType.GEM_EXCHANGE) {
        await this.rewardService.rewardUser(uid, {
          gem: item.gemExchange.GEM_REWARD,
        });
        userItem.EXPIRE_DATE = today;
      }

      const saved = await this.userItemsRepository.save(userItem);

      return await this.userItemsRepository.findOne({
        where: {
          USER_ITEM_ID: saved.USER_ITEM_ID,
        },
        relations: ['item'],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `${error.status}: ${error.message}`,
      );
    }
  }

  async buyItem(uid: number, itemId: number) {
    try {
      const item = await this.shopItemRepository.findOne({
        where: {
          ITEM_ID: itemId,
        },
        relations: ['expBooster', 'gemExchange'],
      });

      if (!item) {
        throw new NotFoundException(`Item with ID ${itemId} not found`);
      }

      const today = new Date(this.dateService.getCurrentDate().timestamp);

      const price = item.PRICE_GEM > 0 ? item.PRICE_GEM : item.PRICE_EXP;
      const userMoney = item.PRICE_GEM > 0 ? 'gem' : 'exp';
      const pay = await this.rewardService.pay(uid, {
        [userMoney]: price,
      });

      if (pay.status === 200) {
        const userItem = this.userItemsRepository.create({
          UID: uid,
          ITEM_ID: itemId,
          PURCHASE_DATE: today,
          EXPIRE_DATE: null,
          IS_ACTIVE: false,
        });

        if (item.ITEM_TYPE === ShopItemType.GEM_EXCHANGE) {
          await this.rewardService.rewardUser(uid, {
            gem: item.gemExchange.GEM_REWARD,
          });
          userItem.EXPIRE_DATE = today;
        }

        const saved = await this.userItemsRepository.save(userItem);

        return await this.userItemsRepository.findOne({
          where: {
            USER_ITEM_ID: saved.USER_ITEM_ID,
          },
          relations: ['item'],
        });
      }
    } catch (error) {
      throw new InternalServerErrorException(
        `${error.status}: ${error.message}`,
      );
    }
  }
}
