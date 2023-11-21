import { createId } from '@paralleldrive/cuid2';
import { date, pgTable, text } from 'drizzle-orm/pg-core';

export const Users = pgTable('users', {
  id: text('users')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  image: text('image'),
  resetPasswordToken: text('resetPasswordToken'),
  resetPasswordExpire: date('resetPasswordExpire', { mode: 'string' }),
  createdAt: date('createdAt', { mode: 'string' }).defaultNow()
});
export type User = typeof Users.$inferSelect;
