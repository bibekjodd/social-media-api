import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { env, validateEnv } from './config/env.config';
import { AllFiltersException } from './filters/all-filters-exception';
import { sessionOptions } from './lib/utils';

async function bootstrap() {
  validateEnv();
  const app = await NestFactory.create(AppModule);

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllFiltersException(httpAdapter));
  app.enableCors({ origin: env.FRONTEND_URLS, credentials: true });

  //
  await app.listen(env.PORT, () => {
    console.log(`Server listening at http://localhost:${env.PORT}`);
  });
}
bootstrap();
