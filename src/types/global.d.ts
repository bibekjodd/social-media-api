import mongoose from "mongoose";

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string;
    }
  }

  namespace Express {
    interface Request {
      user: {
        _id: mongoose.Types.ObjectId;
      };
    }
  }
}
