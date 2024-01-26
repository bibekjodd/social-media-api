import { env } from '@/config/env.config';
import { users } from '@/schemas/user.schema';
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

export const selectUserSnapshot = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  createdAt: users.createdAt
};
