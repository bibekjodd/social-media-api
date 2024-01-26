import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { env, validateEnv } from './config/env.config';

async function bootstrap() {
  validateEnv();
  const adapter = new ExpressAdapter();
  const app = await NestFactory.create(AppModule, adapter);
  app.enableCors({ origin: env.FRONTEND_URLS, credentials: true });
  await app.listen(env.PORT, () => {
    console.log(`Server listening at http://localhost:${env.PORT}`);
  });
}
bootstrap();
