import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ProductController } from 'src/products/products.controller';
import { ProductsRepository } from 'src/products/products.repository';
import { ProductsService } from 'src/products/products.service';

@Module({
  imports: [
    PrismaModule,
    CloudinaryModule,
    MulterModule.register({
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
    CacheModule.register({
      ttl: 300,
      max: 100,
    }),
  ],
  controllers: [ProductController],
  providers: [ProductsService, ProductsRepository],
})
export class ProductsModule {}
