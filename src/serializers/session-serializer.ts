import { db } from '@/config/database';
import { UserSnapshot, selectUserSnapshot, users } from '@/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { eq } from 'drizzle-orm';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  serializeUser(
    user: UserSnapshot,
    done: (err: Error | null, user: any) => void
  ): any {
    done(null, user.id);
  }

  async deserializeUser(
    id: string,
    done: (err: Error | null, user: UserSnapshot | null) => void
  ): Promise<any> {
    try {
      const [user] = await db
        .select(selectUserSnapshot)
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  }
}
