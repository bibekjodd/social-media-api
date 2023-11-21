import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { cookieOptions, generateToken, hashPassword } from '@/lib/utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Users, type User } from '@/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

type RegisterUserBody = Omit<User, 'id'>;
export const registerUser = catchAsyncError<unknown, unknown, RegisterUserBody>(
  async (req, res, next) => {
    const { email, image_url, name, password } = req.body;
    if (!email || !name || !password)
      return next(new CustomError('Please provide all the required fields!'));
    z.string().email('Invalid email provided!').parse(email);

    const [userExists] = await db
      .select()
      .from(Users)
      .where(eq(Users.email, email))
      .limit(1);
    if (userExists) {
      return next(new CustomError('User with same email already exists!'));
    }

    const hashedPassword = await hashPassword(password);
    const [user] = await db
      .insert(Users)
      .values({ name, email, password: hashedPassword, image_url })
      .returning();

    if (!user) {
      return next(new CustomError('Could not register user'));
    }

    const token = generateToken(user.id);
    return res.cookie('token', token, cookieOptions).json({ user });
  }
);
