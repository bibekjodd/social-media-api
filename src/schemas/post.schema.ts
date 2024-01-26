import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { users } from './user.schema';

export const posts = pgTable(
  'posts',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    caption: text('caption'),
    image: text('image'),
    userId: text('userId').notNull(),
    createdAt: timestamp('created_at', { mode: 'string' })
      .notNull()
      .defaultNow()
  },
  function constaints(table) {
    return {
      userReference: foreignKey({
        name: 'fk_user_id',
        columns: [table.userId],
        foreignColumns: [users.id]
      }).onDelete('cascade'),

      userIdIndex: index('posts_idx_user_id').on(table.userId)
    };
  }
);
export type Post = typeof posts.$inferSelect;
