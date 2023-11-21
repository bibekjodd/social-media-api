import { config } from 'dotenv';
import { z } from 'zod';

if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env' });
}

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'testing'])
    .readonly()
    .default('development')
    .optional(),
  DATABASE_URL: z.string().readonly(),
  PORT: z.string().optional().readonly()
});
export const env = envSchema.parse(process.env);
export type EnvType = z.infer<typeof envSchema>;
