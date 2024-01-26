import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import session from 'express-session';
import passport from 'passport';
import { AppModule } from './app.module';
import { env, validateEnv } from './config/env.config';
import { AllFiltersException } from './filters/all-filters-exception';
import { sessionOptions } from './lib/utils';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  validateEnv();
  const app = await NestFactory.create(AppModule);

  app.use(session(sessionOptions));
  app.use(passport.initialize());
  app.use(passport.session());

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllFiltersException(httpAdapter));
  app.enableCors({ origin: env.FRONTEND_URLS, credentials: true });

  const config = new DocumentBuilder()
    .setTitle('Social Media Api')
    .setDescription(
      'Social media api with full CRUD on Users, Posts, Likes and Comments<br>'
    )
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //
  await app.listen(env.PORT, () => {
    console.log(`Server listening at http://localhost:${env.PORT}`);
  });
}
bootstrap();
