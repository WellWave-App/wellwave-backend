import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ImageService } from './image.service';
import path from 'path';
import { Response } from 'express';

@Controller('get-image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get(':filename')
  async getImage(@Param('filename') filename: string, @Res() res: Response) {
    const imagePath = await this.imageService.getImage(filename);
    res.set({
      'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
      Vary: 'Accept-Encoding',
    });
    return res.sendFile(imagePath);
  }
}
