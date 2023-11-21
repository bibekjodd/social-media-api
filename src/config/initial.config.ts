import express, { type Express } from 'express';
import { env } from './env.config';

/**
 * - Initial config for app
 * - crash app if required `env` is not provided
 */
export default function initialConfig(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', async (req, res) => {
    return res.json({
      message: 'Api is running fine...',
      env: env.NODE_ENV,
      date: new Date().toISOString()
    });
  });
  //
}
