import { Injectable, NotFoundException } from '@nestjs/common';
import { join } from 'path';
import { promises as fs } from 'fs';

@Injectable()
export class ImageService {
  private readonly uploadPath = join(process.cwd(), 'assets', 'images');

  async getImage(filename: string): Promise<string> {
    try {
      const filePath = join(this.uploadPath, filename);
      
      // Check if file exists and is within the uploads directory (security measure)
      if (!filePath.startsWith(this.uploadPath)) {
        throw new NotFoundException('Invalid file path');
      }
      
      await fs.access(filePath);
      return filePath;
    } catch (error) {
      throw new NotFoundException('Image not found');
    }
  }

  getImageUrl(filename: string): string {
    return `/get-image/${filename}`;
  }
}
