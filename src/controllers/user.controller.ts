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
    const { email, image, name, password } = req.body;
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
      .values({ name, email, password: hashedPassword, image })
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
    return res
      .cookie('token', token, cookieOptions)
      .json({ user: { ...user, password: undefined } });
  }
);

export const getUserProfile = catchAsyncError(async (req, res) => {
  return res.json({ user: { ...req.user, password: undefined } });
});

type UpdateProfileBody = {
  name?: string;
  email?: string;
  image?: string;
};
export const updateProfile = catchAsyncError<
  unknown,
  unknown,
  UpdateProfileBody
>(async (req, res) => {
  const { name, email, image } = req.body;
  if (!name && !email && !image)
    return res.json({
      user: req.user,
      message: 'Profile updated successfully'
    });

  z.string().email('Invalid email provided').optional().parse(email);

  const [user] = await db
    .update(Users)
    .set({
      name: name || undefined,
      email: email || undefined,
      image: image || undefined
    })
    .where(eq(Users.id, req.user.id))
    .returning();

  return res.json({ user, message: 'Profile updated successfully' });
});

type UpdatePasswordBody = {
  oldPassword?: string;
  newPassword?: string;
};
export const updatePassword = catchAsyncError<
  unknown,
  unknown,
  UpdatePasswordBody
>(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword)
    return next(new CustomError('Please provide both old and new passwords'));

  const isMatch = await comparePassword(oldPassword, req.user.password);
  if (!isMatch) return next(new CustomError("Old password doesn't match"));

  const hashedPassword = await hashPassword(newPassword);

  const [user] = await db
    .update(Users)
    .set({ password: hashedPassword })
    .where(eq(Users.id, req.user.id))
    .returning();

  if (!user) return next(new CustomError("Couldn't update password"));

  return res.json({ user, message: 'Password updated successfully' });
});

export const deleteProfile = catchAsyncError(async (req, res) => {
  await db.delete(Users).where(eq(Users.id, req.user.id));
  return res.json({ message: 'Account deleted successfully' });
});
