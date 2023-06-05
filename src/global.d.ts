import {IUser} from './models/user.model'

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string;
    }
  }

  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
