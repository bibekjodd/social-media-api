import { z } from 'zod';

const imageRegExp = new RegExp(`(https?://.*.(png|gif|webp|jpeg|jpg))`);
export const imageSchema = z
  .string({ invalid_type_error: 'Invalid image url' })
  .trim()
  .regex(imageRegExp, 'invalid image url')
  .max(100, 'Too long image uri');
const nameSchema = z
  .string()
  .min(5, 'Name must be at least 5 characters')
  .max(30, "Name can't exceed 30 characters")
  .trim();
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(20, "Password can't exceed 20 characters")
  .trim();

export const registerUserSchema = z.object({
  name: nameSchema,
  email: z.string().email(),
  password: passwordSchema,
  image: imageSchema.optional()
});
export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const updateProfileSchema = z
  .object({
    name: nameSchema,
    email: z.string().email().optional(),
    image: imageSchema.optional()
  })
  .refine((data) => {
    if (!data.name && !data.email && !data.image) return false;
    return true;
  }, 'Incomplete data provided');
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z
  .object({
    oldPassword: passwordSchema,
    newPassword: passwordSchema,
    passwordResetPageUrl: z.string().optional()
  })
  .refine((data) => {
    if (data.oldPassword === data.newPassword) {
      return false;
    }
    return true;
  }, "Old and new passwords can't be the same");
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  passwordResetPageUrl: z
    .string()
    .trim()
    .optional()
    .transform((data) => data || 'http://localhost:5000/api/password/reset')
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: passwordSchema
});
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
