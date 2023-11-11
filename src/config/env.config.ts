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
  PORT: z.string().optional().readonly(),
  ANY_OTHER_ENV: z.string().optional()
});
export const env = envSchema.parse(process.env);
export type EnvType = z.infer<typeof envSchema>;
