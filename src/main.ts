import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';

async function bootstrap() {
  const adapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, adapter);
  await app.listen(5000);
}
bootstrap();
