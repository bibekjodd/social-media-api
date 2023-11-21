import { db } from '@/config/database';
import { env } from '@/config/env.config';
import { CustomError } from '@/lib/custom-error';
import { Users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import { catchAsyncError } from './catch-async-error';

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
