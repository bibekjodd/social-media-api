import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import { env } from './env.config';

/**
 * - Initial config for app
 * - crash app if required `env` is not provided
 */
export default function initialConfig(app: Express) {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(
    cors({
      origin: env.FRONTEND_URLS?.split(' ') || [],
      credentials: true
    })
  );

  app.get('/', async (req, res) => {
    return res.json({
      message: 'Api is running fine...',
      env: env.NODE_ENV,
      date: new Date().toISOString()
    });
  });
  //
}
