import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp,
  varchar
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const posts = pgTable(
  'posts',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    caption: varchar('caption', { length: 500 }),
    image: varchar('image', { length: 200 }),
    authorId: text('author_id').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .notNull()
      .defaultNow()
  },
  function constaints(table) {
    return {
      userReference: foreignKey({
        name: 'fk_author_id',
        columns: [table.authorId],
        foreignColumns: [users.id]
      }).onDelete('cascade'),

      userIdIndex: index('posts_idx_author_id').on(table.authorId)
    };
  }
);
export type Post = typeof posts.$inferSelect;
export const selectPostSnapshot = {
  id: posts.id,
  caption: posts.caption,
  image: posts.image,
  authorId: posts.authorId,
  createdAt: posts.createdAt
};
export type PostSnapshot = {
  id: string;
  caption: string | null;
  image: string | null;
  authorId: string;
  createdAt: string;
};
