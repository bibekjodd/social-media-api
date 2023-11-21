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
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  sameSite: 'none',
  secure: false,
  httpOnly: true
};

export const generateCookieToken = (id: string): string => {
  const token = jwt.sign({ id }, env.JWT_SECRET);
  return token;
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
