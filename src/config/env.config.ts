import { config } from 'dotenv';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'testing'])
    .default('development')
    .readonly(),
  PORT: z.string().default('5000').readonly(),
  DATABASE_URL: z.string().readonly(),
  FRONTEND_URLS: z
    .string()
    .optional()
    .transform((data) => (data || '').split(' '))
});

export type EnvType = z.infer<typeof envSchema>;
export const validateEnv = (): EnvType => {
  if (process.env.NODE_ENV !== 'production') {
    config({ path: '.env' });
  }
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.log('Environment variables are not configured');
    console.log('Exitting app...');
    process.exit(1);
  }
};
export const env = validateEnv();
