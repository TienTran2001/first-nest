import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
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
      {
        value: image.publicId,
        expires: Date.now() + 300000,
      },
      0,
    );
    return image;
  }

  async cleanupExpiredImages() {
    const cacheStore = this.cacheManager.stores[0].opts.store as Map<
      string,
      string
    >;
    type CacheValue = {
      value: string;
      expires: number;
    };
    const result: CacheValue[] = Array.from(cacheStore.entries())
      .filter(([key]) => key.startsWith('keyv:image:'))
      .map(([, valueString]) => {
        const valueObj = JSON.parse(valueString) as { value: CacheValue };
        return valueObj.value;
      });

    const now = Date.now();

    for (const image of result) {
      if (now > image.expires) {
        await this.cloudinaryService.deleteImage(image.value);
        await this.cacheManager.del(`image:${image.value}`);
        console.log(`🗑️ Deleted expired temp image: ${image.value}`);
      }
    }
  }

  @Cron('0 */1 * * * *')
  async handleExpiredImages() {
    console.log('Start cleaning expired images in cloudinary');
    await this.cleanupExpiredImages();
    console.log('Expired images cleaned');
  }

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

  // Get the publicId from the old image URL to delete from cloudinary
  private partsToPublicId(imageUrl: string) {
    const parts = imageUrl.split('/upload/')[1].split('/');
    parts.shift();
    return parts.join('/').split('.')[0];
  }

  async update(id: string, data: Prisma.ProductUpdateInput) {
    const product = await this.productRepository.findOne('id', id);

    if (!product) return null;

    const isSameImage = product.imageUrl === data.imageUrl;
    const oldImageUrl = product.imageUrl;

    const updateProduct = await this.productRepository.update(id, data);

    if (!isSameImage && oldImageUrl) {
      const publicId = this.partsToPublicId(oldImageUrl);

      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return updateProduct;
  }

  async delete(id: string) {
    const product = await this.productRepository.findOne('id', id);

    if (!product) return null;

    const result = await this.productRepository.remove(id);

    if (product.imageUrl) {
      const publicId = this.partsToPublicId(product.imageUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }
    }

    return result;
  }
}
