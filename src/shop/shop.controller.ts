import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShopItemType } from './enum/item-type.enum';
import { RoleGuard } from '@/auth/guard/role.guard';
import { JwtAuthGuard } from '@/auth/guard/jwt-auth.guard';
import { Role } from '@/auth/roles/roles.enum';
import { Roles } from '@/auth/roles/roles.decorator';
import {
  CreateExpBoosterDto,
  CreateGemExchangeDto,
  CreateShopItemDto,
} from './dto/create-items.dto';
import {
  UpdateExpBoosterDto,
  UpdateGemExchangeDto,
} from './dto/update-items.dto';

@UseGuards(JwtAuthGuard, RoleGuard)
@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post('/buy-item/:itemId')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  userBuyItem(
    @Req() req,
    @Param('itemId') itemId: number,
    @Query('uid') uid?: number,
  ) {
    uid = uid || req.user.UID;
    if (typeof itemId === 'string') {
      itemId = parseInt(itemId, 10);
    }

    return this.shopService.buyItem(+uid, +itemId);
  }

  @Post('/items')
  @UseInterceptors(FileInterceptor('file'))
  @Roles(Role.ADMIN, Role.MODERATOR)
  create(
    @Body() dto: CreateShopItemDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Convert string values to appropriate types since form-data sends everything as strings
    if (typeof dto.PRICE_GEM === 'string')
      dto.PRICE_GEM = parseFloat(dto.PRICE_GEM);
    if (typeof dto.PRICE_EXP === 'string')
      dto.PRICE_EXP = parseFloat(dto.PRICE_EXP);
    if (typeof dto.RARITY === 'string') dto.RARITY = parseFloat(dto.RARITY);
    if (typeof dto.IS_ACTIVE === 'string')
      dto.IS_ACTIVE = dto.IS_ACTIVE === 'true';

    // Handle type-specific conversions
    if (dto.ITEM_TYPE === ShopItemType.EXP_BOOST) {
      const expDto = dto as CreateExpBoosterDto;
      if (typeof expDto.BOOST_MULTIPLIER === 'string')
        expDto.BOOST_MULTIPLIER = parseFloat(expDto.BOOST_MULTIPLIER);
      if (typeof expDto.BOOST_DAYS === 'string')
        expDto.BOOST_DAYS = parseInt(expDto.BOOST_DAYS, 10);
    } else if (dto.ITEM_TYPE === ShopItemType.GEM_EXCHANGE) {
      const gemDto = dto as CreateGemExchangeDto;
      if (typeof gemDto.GEM_REWARD === 'string')
        gemDto.GEM_REWARD = parseFloat(gemDto.GEM_REWARD);
    }

    return this.shopService.createItems(dto, file);
  }

  @Get('/items')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  getAllShopItems(
    @Query('name') name?: string,
    @Query('type') type?: ShopItemType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('pagination') pagination?: boolean,
    @Query('filter') filter?: 'all' | 'inBox' | 'notInBox',
  ) {
    if (page || limit) {
      pagination = true;
    }

    // Convert query parameters to appropriate types
    const queryParams = {
      name,
      type,
      page: page ? parseInt(String(page), 10) : undefined,
      limit: limit ? parseInt(String(limit), 10) : undefined,
      pagination,
      filter: filter || 'all',
    };

    return this.shopService.getAllItems(queryParams);
  }

  @Get('items/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.findOne(id);
  }

  @Patch('items/:id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateShopItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Convert string values to appropriate types
    if (typeof dto.PRICE_GEM === 'string')
      dto.PRICE_GEM = parseFloat(dto.PRICE_GEM);
    if (typeof dto.PRICE_EXP === 'string')
      dto.PRICE_EXP = parseFloat(dto.PRICE_EXP);
    if (typeof dto.RARITY === 'string') dto.RARITY = parseFloat(dto.RARITY);
    if (typeof dto.IS_ACTIVE === 'string')
      dto.IS_ACTIVE = dto.IS_ACTIVE === 'true';

    // Handle type-specific conversions based on item type
    if (dto.ITEM_TYPE === ShopItemType.EXP_BOOST) {
      const expDto = dto as UpdateExpBoosterDto;
      if (typeof expDto.BOOST_MULTIPLIER === 'string')
        expDto.BOOST_MULTIPLIER = parseFloat(expDto.BOOST_MULTIPLIER);
      if (typeof expDto.BOOST_DAYS === 'string')
        expDto.BOOST_DAYS = parseInt(expDto.BOOST_DAYS, 10);
    } else if (dto.ITEM_TYPE === ShopItemType.GEM_EXCHANGE) {
      const gemDto = dto as UpdateGemExchangeDto;
      if (typeof gemDto.GEM_REWARD === 'string')
        gemDto.GEM_REWARD = parseFloat(gemDto.GEM_REWARD);
    }

    return this.shopService.update(id, dto, file);
  }

  @Delete('items/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.shopService.remove(id);
  }

  @Post('mystery-box/:boxName')
  @UseInterceptors(FileInterceptor('file'))
  async createAndAddToMysteryBox(
    @Param('boxName') boxName: string,
    @Body() dto: CreateShopItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // Convert string values to appropriate types
    if (typeof dto.PRICE_GEM === 'string')
      dto.PRICE_GEM = parseFloat(dto.PRICE_GEM);
    if (typeof dto.PRICE_EXP === 'string')
      dto.PRICE_EXP = parseFloat(dto.PRICE_EXP);
    if (typeof dto.RARITY === 'string') dto.RARITY = parseFloat(dto.RARITY);
    if (typeof dto.IS_ACTIVE === 'string')
      dto.IS_ACTIVE = dto.IS_ACTIVE === 'true';

    // Handle type-specific conversions
    if (dto.ITEM_TYPE === ShopItemType.EXP_BOOST) {
      const expDto = dto as CreateExpBoosterDto;
      if (typeof expDto.BOOST_MULTIPLIER === 'string')
        expDto.BOOST_MULTIPLIER = parseFloat(expDto.BOOST_MULTIPLIER);
      if (typeof expDto.BOOST_DAYS === 'string')
        expDto.BOOST_DAYS = parseInt(expDto.BOOST_DAYS, 10);
    } else if (dto.ITEM_TYPE === ShopItemType.GEM_EXCHANGE) {
      const gemDto = dto as CreateGemExchangeDto;
      if (typeof gemDto.GEM_REWARD === 'string')
        gemDto.GEM_REWARD = parseFloat(gemDto.GEM_REWARD);
    }

    // If file is provided, set it to DTO
    if (file) {
      dto.file = file;
    }

    return this.shopService.createAndAddToMysteryBox(dto, boxName);
  }

  @Get('/open-mystery-box/:boxName')
  getRandom(@Param('boxName') boxName: string) {
    return this.shopService.getRandomItem(boxName);
  }

  @Post('mystery-box/open/:boxName')
  @Roles(Role.ADMIN, Role.MODERATOR, Role.USER)
  useMysteryBox(
    @Param('boxName') boxName: string,
    @Req() req,
    @Query('uid', ParseIntPipe) uid: number,
  ) {
    if (uid === undefined) {
      uid = req.user.UID;
    }

    // for now we only use one box
    // boxName = 'main';
    return this.shopService.randomMystery(uid, boxName);
  }
}
