import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
    @Param('imageId') imageId: string,
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
    const res = await this.productService.create(body, imageId);
    return {
      message: 'Product created successfully',
      data: res,
    };
  }

  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-image')
  @Roles(Role.ADMIN)
  async uploadImage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
        fileIsRequired: false,
      }),
    )
    file: Express.Multer.File,
  ) {
    const res = await this.productService.upLoadImage(file);
    if (!res) {
      return {
        message: 'Image upload failed',
        data: null,
      };
    }
    return {
      message: 'Image uploaded successfully',
      data: res,
    };
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.productService.findAll(paginationDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(createProductSchema))
    body: TypeCreateProductSchema,
  ) {
    const product = await this.productService.findOne('id', id);
    if (!product) {
      return {
        message: 'Product not found',
        data: null,
      };
    }
    if (body.name && product.name !== body.name) {
      const productNameExisting = await this.productService.findOne(
        'name',
        body.name,
      );
      if (productNameExisting) {
        return {
          message: 'Product name already exists',
          data: null,
        };
      }
    }

    const res = await this.productService.update(id, body);
    return {
      message: 'Product updated successfully',
      data: res,
    };
  }
}
