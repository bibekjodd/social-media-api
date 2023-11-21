import { env } from '@/config/env.config';
import bcrypt from 'bcryptjs';
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

export const generateToken = (id: string): string => {
  const token = jwt.sign({ id }, env.JWT_SECRET);
  return token;
};
