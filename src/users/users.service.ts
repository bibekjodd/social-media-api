import { db } from '@/config/database';
import { sendResetPasswordMail } from '@/lib/send-mail';
import { generateResetPasswordToken } from '@/lib/utils';
import { UserSnapshot, selectUserSnapshot, users } from '@/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcryptjs';
import crypto from 'crypto';
import { and, eq, gte, ilike, or } from 'drizzle-orm';
import {
  ForgotPasswordSchema,
  RegisterUserSchema,
  ResetPasswordSchema,
  UpdatePasswordSchema,
  UpdateProfileSchema
} from './user.dto';

@Injectable()
export class UsersService {
  async searchUsers(
    query: Record<string, string | undefined>
  ): Promise<{ users: UserSnapshot[] }> {
    const q = `%${query.q || ''}%`;
    let limit = Number(query.limit) || 10;
    if (limit > 50) limit = 50;
    if (limit < 1) limit = 10;
    const result = await db
      .select(selectUserSnapshot)
      .from(users)
      .where(or(ilike(users.name, q), ilike(users.email, q)))
      .limit(limit);
    return { users: result };
  }

  async registerUser(
    data: RegisterUserSchema
  ): Promise<{ user: UserSnapshot }> {
    const [userExists] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, data.email))
      .limit(1);
    if (userExists) {
      throw new BadRequestException('User with same email already exists');
    }

    const hashedPassword = await hash(data.password, 10);
    const [createdUser] = await db
      .insert(users)
      .values({ ...data, password: hashedPassword })
      .returning(selectUserSnapshot);
    return { user: createdUser };
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileSchema
  ): Promise<{ user: UserSnapshot }> {
    const [user] = await db
      .update(users)
      .set(data)
      .where(eq(users.id, userId))
      .returning(selectUserSnapshot);

    return { user };
  }

  async deleteProfile(userId: string) {
    await db.delete(users).where(eq(users.id, userId));
    return { message: 'Accout deleted successfully' };
  }

  async updatePassword(userId: string, data: UpdatePasswordSchema) {
    const { oldPassword, newPassword } = data;
    if (oldPassword === newPassword) {
      throw new BadRequestException("Old and new passwords can't be the same");
    }
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) {
      throw new BadRequestException('User does not exist');
    }
    const isMatch = await compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Old password does not match');
    }

    const hashedPassword = await hash(newPassword, 10);
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    return { message: 'Password updated successfully' };
  }

  async forgotPassword(data: ForgotPasswordSchema) {
    const { email, passwordResetPageUrl } = data;

    const [userExists] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!userExists) {
      throw new BadRequestException('User does not exist');
    }

    const { resetPasswordExpire, resetPasswordToken, token } =
      generateResetPasswordToken();
    await db
      .update(users)
      .set({ resetPasswordExpire, resetPasswordToken })
      .where(eq(users.email, email));

    sendResetPasswordMail({ email, passwordResetPageUrl, token });
    return {
      message: `Password reset link sent to ${email}. Link will expire after 15 minutes!`
    };
  }

  async resetPassword(
    data: ResetPasswordSchema
  ): Promise<{ user: UserSnapshot }> {
    const { newPassword, token } = data;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetPasswordToken, resetPasswordToken),
          gte(users.resetPasswordExpire, new Date().toISOString())
        )
      )
      .limit(1);

    if (!user) {
      throw new BadRequestException('Invalid token or token expired');
    }
    const hashedPassword = await hash(newPassword, 10);
    const [userResult] = await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordExpire: null,
        resetPasswordToken: null
      })
      .where(eq(users.id, user.id))
      .returning(selectUserSnapshot);

    return { user: userResult };
  }
}
