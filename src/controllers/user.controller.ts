import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import sendMail from '@/lib/send-mail';
import {
  comparePassword,
  cookieOptions,
  filterUser,
  generateCookieToken,
  generateResetPasswordToken,
  hashPassword
} from '@/lib/utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Users, type User } from '@/schema/user.schema';
import crypto from 'crypto';
import { and, eq, gte, ilike, or } from 'drizzle-orm';
import { z } from 'zod';

export const searchUsers = catchAsyncError<
  unknown,
  unknown,
  unknown,
  { q?: string; limit?: string }
>(async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  const limit = Number(req.query.limit) || 10;

  const users = await db
    .select({
      id: Users.id,
      name: Users.name,
      email: Users.email,
      image: Users.image
    })
    .from(Users)
    .where(or(ilike(Users.name, q), ilike(Users.email, q)))
    .limit(limit);

  return res.json({ users });
});

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

    const token = generateCookieToken(user.id);
    return res
      .cookie('token', token, cookieOptions)
      .json({ user: filterUser(user) });
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

    const token = generateCookieToken(user.id);
    return res
      .cookie('token', token, cookieOptions)
      .json({ user: filterUser(user) });
  }
);

export const getUserProfile = catchAsyncError(async (req, res) => {
  return res.json({ user: filterUser(req.user) });
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
>(async (req, res, next) => {
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

  if (!user) {
    return next(new CustomError('Could not update profile'));
  }

  return res.json({
    user: filterUser(user),
    message: 'Profile updated successfully'
  });
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

  return res.json({
    user: filterUser(user),
    message: 'Password updated successfully'
  });
});

type ForgotPasswordBody = { email: string; passwordResetPageUrl?: string };
export const forgotPassword = catchAsyncError<
  unknown,
  unknown,
  ForgotPasswordBody
>(async (req, res, next) => {
  const { email } = req.body;
  const passwordResetPageUrl =
    req.body.passwordResetPageUrl || 'http://localhost:5000/api/password/reset';

  z.string({ required_error: 'Please provide email' })
    .email('Invalid email')
    .parse(email);

  const [userExists] = await db
    .select()
    .from(Users)
    .where(eq(Users.email, email))
    .limit(1);

  if (!userExists)
    return next(new CustomError("User with this email doesn't exist"));

  const { token, resetPasswordToken, resetPasswordExpire } =
    generateResetPasswordToken();

  await db
    .update(Users)
    .set({ resetPasswordExpire, resetPasswordToken })
    .where(eq(Users.email, email));

  res.json({
    message: `Password reset link sent to ${email}. Link will expire after 15 minutes!`
  });

  const passwordResetLink = `${passwordResetPageUrl}?token=${token}`;
  const html = `
  <div>
    <h3>
      Password recovery for social media app
    </h3>
    <p>Update within 15 minutes before link expires</p>
    <a href='${passwordResetLink}' target='_blank' rel='noopener noreferrer'>
      Click here to reset Password
    </a>
  </div>
  `;

  sendMail({
    html,
    mail: email,
    subject: 'Password Recovery for social media app'
  });
});

export const resetPassword = catchAsyncError<
  unknown,
  unknown,
  { newPassword?: string },
  { token?: string }
>(async (req, res, next) => {
  const { newPassword } = req.body;
  const { token } = req.query;
  if (!token) return next(new CustomError('Please provide valid token'));
  if (!newPassword) return next(new CustomError('Please provide new password'));

  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
  const [user] = await db
    .select()
    .from(Users)
    .where(
      and(
        eq(Users.resetPasswordToken, resetPasswordToken),
        gte(Users.resetPasswordExpire, new Date().toISOString())
      )
    )
    .limit(1);

  if (!user) {
    return next(new CustomError('Invalid token or token expired'));
  }

  const hashedPassword = await hashPassword(newPassword);
  await db
    .update(Users)
    .set({
      password: hashedPassword,
      resetPasswordExpire: null,
      resetPasswordToken: null
    })
    .where(eq(Users.id, user.id));

  const cookieToken = generateCookieToken(user.id);
  return res
    .cookie('token', cookieToken, cookieOptions)
    .json({ user: filterUser(user) });
});

export const deleteProfile = catchAsyncError(async (req, res) => {
  await db.delete(Users).where(eq(Users.id, req.user.id));
  return res.json({ message: 'Account deleted successfully' });
});
