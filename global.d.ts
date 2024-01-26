import { UserSnapshot } from '@/schemas/user.schema';

export {};
declare module 'express' {
  export interface Request {
    user: UserSnapshot;
  }
}
