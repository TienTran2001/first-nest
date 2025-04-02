import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductsRepository } from 'src/products/products.repository';
import { TypeCreateProductSchema } from 'src/products/schemas/product.schema';
import { PaginationDto } from 'src/schema/schema';

@Injectable()
export class ProductsService {
  constructor(private productRepository: ProductsRepository) {}

  async create(createProductDto: TypeCreateProductSchema) {
    return this.productRepository.create(createProductDto);
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
}
