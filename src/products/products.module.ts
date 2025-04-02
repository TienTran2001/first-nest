import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductController } from 'src/products/products.controller';
import { ProductsRepository } from 'src/products/products.repository';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
