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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Get Image')
@Controller('get-image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @ApiOperation({ summary: 'Get image by filename' })
  @ApiParam({
    name: 'filename',
    description: 'Name of the image file',
    example: 'profile-123.jpg',
  })
  @ApiResponse({
    status: 200,
    description: 'Image file returned successfully',
    content: {
      'image/*': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Image not found' })
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
