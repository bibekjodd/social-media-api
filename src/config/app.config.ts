import { config } from 'dotenv';
import express, { Express } from 'express';
import { validateEnv } from './env.config';

/**
 * - Initial config for app
 *
 * - validate `process.env`
 *
 * - crash app if required `env` is not provided
 */
export default function appConfig(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  if (process.env.NODE_ENV !== 'production') {
    config({ path: '.env' });
  }

  validateEnv();

  app.get('/', (req, res) => {
    return res.json({
      message: 'Api is running fine...',
      env: process.env.NODE_ENV
    });
  });
  //
}
