import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'testing'])
    .readonly()
    .default('development')
    .optional(),
  PORT: z.string().optional().readonly()
});

export const validateEnv = () => {
  envSchema.parse(process.env);
};

export type EnvType = z.infer<typeof envSchema>;
