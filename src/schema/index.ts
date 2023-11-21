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
  createdAt: date('createdAt', { mode: 'string' }).notNull().defaultNow()
});
export type User = typeof Users.$inferSelect;

export const Posts = pgTable('posts', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text('title'),
  image: text('image'),
  userId: text('userId')
    .notNull()
    .references(() => Users.id),
  postId: text('postId')
    .notNull()
    .references(() => Users.id),
  createdAt: date('createdAt', { mode: 'string' }).notNull().defaultNow()
});
export type Post = typeof Posts.$inferSelect;

export const Comments = pgTable('comments', {
  id: text('id')
    .notNull()
    .primaryKey()
    .$defaultFn(() => createId()),
  comment: text('comment').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => Users.id),
  postId: text('postId')
    .notNull()
    .references(() => Posts.id),
  createdAt: date('createdAt', { mode: 'string' }).defaultNow()
});
export type Comment = typeof Comments.$inferSelect;
