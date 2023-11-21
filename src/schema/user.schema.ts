import { createId } from '@paralleldrive/cuid2';
import { date, pgTable, text, unique } from 'drizzle-orm/pg-core';

export const Users = pgTable(
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
    resetPasswordToken: text('resetPasswordToken'),
    resetPasswordExpire: date('resetPasswordExpire', { mode: 'string' }),
    createdAt: date('createdAt', { mode: 'string' }).notNull().defaultNow()
  },
  function constraints(table) {
    return {
      uniqueEmail: unique('uk_email').on(table.email)
    };
  }
);
export type User = typeof Users.$inferSelect;
