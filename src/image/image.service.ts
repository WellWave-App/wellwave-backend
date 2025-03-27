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

  async deleteImage(filename: string): Promise<void> {
    try {
      const filePath = join(this.uploadPath, filename);

      // Security check to ensure the file path is within the uploads directory
      if (!filePath.startsWith(this.uploadPath)) {
        throw new Error('Invalid file path');
      }

      // Check if file exists before attempting to delete
      await fs.access(filePath);

      // Delete the file
      await fs.unlink(filePath);
    } catch (error) {
      // Log error but don't throw - deletion is usually part of cleanup
      console.error('Error deleting image:', error);
    }
  }

  async deleteImageByUrl(imageUrl: string): Promise<void> {
    if (!imageUrl) return;

    // Extract filename from URL
    const filename = imageUrl.split('/').pop();
    if (filename) {
      await this.deleteImage(filename);
    }
  }
}
