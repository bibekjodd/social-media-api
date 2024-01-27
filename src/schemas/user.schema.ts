import { createId } from '@paralleldrive/cuid2';
import {
  date,
  pgTable,
  text,
  timestamp,
  unique,
  varchar
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    name: varchar('name', { length: 30 }).notNull(),
    email: varchar('email', { length: 40 }).notNull(),
    password: text('password').notNull(),
    image: varchar('image', { length: 200 }),
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
