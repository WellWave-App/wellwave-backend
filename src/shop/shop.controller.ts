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
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() createShopItemDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {}
}
