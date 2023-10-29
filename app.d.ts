import { EnvType } from "./src/lib/validate-env";
import { UserSchema } from "./src/models/user.model";

export {};
declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvType {
      NODE_ENV: "development" | "production";
    }
  }

  namespace Express {
    interface Request {
      user: UserSchema;
    }
  }

  var envLoaded: boolean;
  var databaseConnected: boolean;
}
