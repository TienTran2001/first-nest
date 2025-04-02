import { Module } from '@nestjs/common';
import { ProductsModule } from 'src/products/products.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, ProductsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
