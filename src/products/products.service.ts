import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Cache } from 'cache-manager';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductsRepository } from 'src/products/products.repository';
import { TypeCreateProductSchema } from 'src/products/schemas/product.schema';
import { PaginationDto } from 'src/schema/schema';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductsRepository,
    private cloudinaryService: CloudinaryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createProductDto: TypeCreateProductSchema, imageId: string) {
    const cacheImage = await this.cacheManager.get(`image:${imageId}`);

    console.log('cache nè: ', cacheImage);

    if (cacheImage) {
      await this.cacheManager.del(`image:${imageId}`);
    } else {
      throw new BadRequestException('Image is not valid or already used');
    }

    return this.productRepository.create(createProductDto);
  }

  async upLoadImage(file: Express.Multer.File) {
    if (!file) {
      return null;
    }
    const image = await this.cloudinaryService.uploadImage(file);
    await this.cacheManager.set(
      `image:${image.publicId}`,
      image.publicId,
      300000,
    );
    return image;
  }
  async cleanupExpiredImages() {
    const cachedImages = await this.cacheManager.get<string[]>('*');

    for (const key of cachedImages || []) {
      const imageIdMatch = key.match(/^image:(.*)$/);
      if (imageIdMatch) {
        const imageId = imageIdMatch[1];
        const cachedImage = await this.cacheManager.get(key);

        if (!cachedImage) {
          await this.cacheManager.del(key);
          await this.cloudinaryService.deleteImage(imageId);
          console.log(`Deleted expired image: ${imageId}`);
        }
      }
    }
  }

  // @Cron('0 */2 * * * *')
  // async handleExpiredImages() {
  //   console.log(
  //     'hihi ------------------------------------------------------------------- clean nè các e',
  //   );
  //   await this.cleanupExpiredImages();
  // }

  async findAll(paginationDto: PaginationDto) {
    const { data, total } = await this.productRepository.findAll(paginationDto);

    const totalPages = Math.ceil(total / Number(paginationDto.limit));

    return {
      data,
      meta: {
        total,
        page: Number(paginationDto.page),
        limit: Number(paginationDto.limit),
        totalPages,
      },
    };
  }

  async findOne(field: keyof Prisma.ProductWhereInput, value: string) {
    return this.productRepository.findOne(field, value);
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.productRepository.update(id, data);
  }
}
