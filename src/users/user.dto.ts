import { z } from 'zod';

export const registerUserSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters')
    .max(30, "Name can't exceed 30 characters"),
  email: z.string().email(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, "Password can't exceed 20 characters"),
  image: z.string().max(200, 'Too long image uri')
});
export type RegisterUserSchema = z.infer<typeof registerUserSchema>;

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(5, 'Name must be at least 5 characters')
    .max(30, "Name can't exceed 30 characters")
    .optional(),
  email: z.string().email().optional(),
  image: z.string().max(200, 'Too long image uri')
});
export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const updatePasswordSchema = z.object({
  oldPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, "Password can't exceed 20 characters"),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, "Password can't exceed 20 characters"),
  passwordResetPageUrl: z.string().optional()
});
export type UpdatePasswordSchema = z.infer<typeof updatePasswordSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
  passwordResetPageUrl: z
    .string()
    .optional()
    .transform((data) => data || 'http://localhost:5000/api/password/reset')
});
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(20, "Password can't exceed 20 characters")
});
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
