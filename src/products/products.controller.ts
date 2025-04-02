import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Roles } from 'src/auth/roles.decorator';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ProductsService } from 'src/products/products.service';
import {
  createProductSchema,
  TypeCreateProductSchema,
} from 'src/products/schemas/product.schema';
import { PaginationDto } from 'src/schema/schema';

@Controller('products')
export class ProductController {
  constructor(private productService: ProductsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @Roles(Role.ADMIN)
  async create(
    @Body(new ZodValidationPipe(createProductSchema))
    body: TypeCreateProductSchema,
  ) {
    const productExisting = await this.productService.findOne(
      'name',
      body.name,
    );

    if (productExisting) {
      return {
        message: 'Product already exists',
        data: null,
      };
    }
    const res = await this.productService.create(body);
    return {
      message: 'Product created successfully',
      data: res,
    };
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }
}
