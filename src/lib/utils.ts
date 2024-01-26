import { env } from '@/config/env.config';
import type { User } from '@/schema/user.schema';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

export const hashPassword = async (password: string): Promise<string> => {
  const hassedPassword = await bcrypt.hash(password, 10);
  return hassedPassword;
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};

export const cookieOptions: CookieOptions = {
  maxAge: Date.now() + 200 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: env.NODE_ENV !== 'production' ? false : true,
  sameSite: env.NODE_ENV !== 'production' ? 'lax' : 'none'
};

export const generateCookieToken = (id: string): string => {
  const token = jwt.sign({ id }, env.JWT_SECRET);
  return token;
};

export const decodeCookieToken = (
  token: string | undefined
): string | undefined => {
  if (!token) return undefined;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as
      | { id?: string }
      | undefined;

    if (typeof decoded?.id === 'string') return decoded.id;
    return undefined;
  } catch (err) {
    return undefined;
  }
};

export const filterUser = (user: User) => {
  return {
    ...user,
    password: undefined,
    resetPasswordExpire: undefined,
    resetPasswordToken: undefined
  };
};

export const generateResetPasswordToken = (): {
  token: string;
  resetPasswordToken: string;
  resetPasswordExpire: string;
} => {
  const token = crypto.randomBytes(20).toString('hex');
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const resetPasswordExpire = new Date(
    Date.now() + 15 * 60 * 1000
  ).toISOString();
  return { token, resetPasswordToken, resetPasswordExpire };
};
