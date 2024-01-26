import { env } from '@/config/env.config';
import crypto from 'crypto';
import MongoStore from 'connect-mongo';
import { SessionOptions } from 'express-session';

export const sessionOptions: SessionOptions = {
  resave: false,
  saveUninitialized: false,
  secret: env.SESSION_SECRET,
  store: new MongoStore({ mongoUrl: env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    secure: env.NODE_ENV === 'production' ? true : false,
    maxAge: Date.now() + 30 * 24 * 60 * 60 * 1000
  },
  proxy: true
};

export const generateResetPasswordToken = (): {
  token: string;
  resetPasswordToken: string;
  resetPasswordExpire: string;
} => {
  const token = crypto.randomBytes(20).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const resetPasswordExpire = new Date(
    Date.now() + 15 * 60 * 1000
  ).toISOString();
  return { token, resetPasswordToken, resetPasswordExpire };
};
