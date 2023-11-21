import { CustomError } from '@/lib/custom-error';
import { catchAsyncError } from './catch-async-error';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env.config';
import { db } from '@/config/database';
import { Users } from '@/schema';
import { eq } from 'drizzle-orm';

export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const token = req.cookies?.token;
  const error = new CustomError('User is not authenticated', 401);

  if (!token) return next(error);

  const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
  if (!decoded?.id) return next(error);

  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, decoded.id))
    .limit(1);
  if (!user) return next(error);

  req.user = user;
  next();
});
