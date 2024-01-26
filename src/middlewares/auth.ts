import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { decodeCookieToken } from '@/lib/utils';
import { Users } from '@/schema/user.schema';
import { eq } from 'drizzle-orm';
import { catchAsyncError } from './catch-async-error';

export const isAuthenticatedUser = catchAsyncError(async (req, res, next) => {
  const error = new CustomError('User is not authenticated', 401);
  const userId = decodeCookieToken(req.cookies?.token);
  if (!userId) return next(error);

  const [user] = await db
    .select()
    .from(Users)
    .where(eq(Users.id, userId))
    .limit(1);
  if (!user) return next(error);

  req.user = user;
  next();
});
