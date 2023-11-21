import { pgTable, text } from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

export const Users = pgTable('users', {
  id: text('users')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  image_url: text('image_url')
});
export type User = typeof Users.$inferSelect;
