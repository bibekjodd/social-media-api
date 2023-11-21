import { EnvType } from '@/config/env.config';
import type { User } from './schema';

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {
      //
    }
  }

  namespace Express {
    interface Request {
      user: User;
    }
  }
}
