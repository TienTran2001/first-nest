import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

@Injectable()
export class CloudinaryService {
  async uploadImage(
    file: Express.Multer.File,
  ): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'first-nest/products',
        },
        (error, result) => {
          if (error) return reject(new Error(error.message));
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      const readable = new Readable();
      readable._read = () => {};
      if (!file || !file.buffer) {
        return reject(new Error('Invalid file input'));
      }

      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
    });
  }

  async deleteImage(public_id: string): Promise<boolean> {
    try {
      const result = (await cloudinary.uploader.destroy(public_id)) as {
        result: string;
      };
      return result.result === 'ok';
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete image: ${error.message}`);
      }
      throw new Error('Failed to delete image');
    }
  }
}
