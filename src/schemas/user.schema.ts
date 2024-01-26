import { createId } from '@paralleldrive/cuid2';
import { date, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: text('name').notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    image: text('image'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpire: date('reset_password_expire', { mode: 'string' }),
    createdAt: timestamp('created_at', { mode: 'string' })
      .notNull()
      .defaultNow()
  },
  function constraints(table) {
    return {
      uniqueEmail: unique('uk_email').on(table.email)
    };
  }
);
export type User = typeof users.$inferSelect;
export type SelectUser = typeof users.$inferSelect;
export type UserSnapshot = Omit<
  SelectUser,
  'password' | 'resetPasswordToken' | 'resetPasswordExpire'
>;
export const selectUserSnapshot = {
  id: users.id,
  name: users.name,
  email: users.email,
  image: users.image,
  createdAt: users.createdAt
};
