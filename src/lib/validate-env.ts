import { z } from "zod";
import dotenv from "dotenv";
import devConsole from "./dev-console";

const envSchema = z.object({
  MONGO_URI: z.string(),
});
export type EnvType = z.infer<typeof envSchema>;

global.envLoaded = false;
export default function validateEnv() {
  if (process.env.NODE_ENV !== "production") {
    dotenv.config({
      path: ".env",
    });
  }

  try {
    envSchema.parse(process.env);
    envLoaded = true;
  } catch (error) {
    envLoaded = false;
    devConsole("Some environment variables are not provided".red);
  }
}
