import { db } from '@/config/database';
import { UserSnapshot, users } from '@/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';

@Injectable()
export class AuthService {
  async validateUser(
    email: string,
    password: string
  ): Promise<UserSnapshot | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (!user) return null;
    const isMatch = await compare(password, user.password);
    if (!isMatch) return null;

    return {
      id: user.id,
      name: user.name,
      createdAt: user.createdAt,
      email: user.email,
      image: user.image
    };
  }
}
