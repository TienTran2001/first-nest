import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ProductsRepository } from 'src/products/products.repository';
import { TypeCreateProductSchema } from 'src/products/schemas/product.schema';
import { PaginationDto } from 'src/schema/schema';

@Injectable()
export class ProductsService {
  constructor(
    private productRepository: ProductsRepository,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createProductDto: TypeCreateProductSchema) {
    return this.productRepository.create(createProductDto);
  }

  async upLoadImage(file: Express.Multer.File) {
    if (!file) {
      return null;
    }
    const imageUrl = await this.cloudinaryService.uploadImage(file);

    return imageUrl;
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

  async update(id: string, data: Prisma.ProductUpdateInput) {
    return this.productRepository.update(id, data);
  }
}
