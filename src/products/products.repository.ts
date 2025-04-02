import { Injectable } from '@nestjs/common';
import { Prisma, Product } from '@prisma/client';
import { PaginationDto } from 'src/schema/schema';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: Prisma.ProductCreateInput): Promise<Product> {
    return this.prisma.product.create({
      data,
    });
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<{ data: Product[]; total: number }> {
    const { page, limit, sortBy, sortOrder, search } = paginationDto;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    let whereCondition: Prisma.ProductWhereInput = {};

    if (search) {
      whereCondition = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    let orderByCondition: Prisma.ProductOrderByWithRelationInput = {
      createdAt: 'desc',
    };
    if (sortBy) {
      orderByCondition = {
        [sortBy]: sortOrder || 'desc',
      } as Prisma.ProductOrderByWithRelationInput;
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take,
        where: whereCondition,
        orderBy: orderByCondition,
      }),
      this.prisma.product.count({ where: whereCondition }),
    ]);

    return { data, total };
  }

  async findOne(
    field: keyof Prisma.ProductWhereInput,
    value: string,
  ): Promise<Product | null> {
    return this.prisma.product.findFirst({
      where: { [field]: value },
    });
  }

  async update(id: string, data: Prisma.ProductUpdateInput): Promise<Product> {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<Product> {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
