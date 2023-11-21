import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import {
  comparePassword,
  cookieOptions,
  generateToken,
  hashPassword
} from '@/lib/utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Users, type User } from '@/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

type RegisterUserBody = Omit<Partial<User>, 'id'>;
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

type LoginUserBody = { email?: string; password?: string };
export const loginUser = catchAsyncError<unknown, unknown, LoginUserBody>(
  async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new CustomError('Please provide all the required fields!'));
    }

    const [user] = await db.select().from(Users).where(eq(Users.email, email));
    if (!user) return next(new CustomError('Invalid user credentials!'));

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) return next(new CustomError('Invalid user credentials!'));

    const token = generateToken(user.id);
    return res.cookie('token', token, cookieOptions).json({ user });
  }
);
