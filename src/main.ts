import { NestFactory } from '@nestjs/core';
import { CatchEverythingFilter } from 'src/common/filters/catch-everything.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CatchEverythingFilter());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
