import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { Users } from './user.schema';

export const Posts = pgTable(
  'posts',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    caption: text('caption'),
    image: text('image'),
    userId: text('userId').notNull(),
    createdAt: timestamp('createdAt', { mode: 'string' }).notNull().defaultNow()
  },
  function constaints(table) {
    return {
      userReference: foreignKey({
        name: 'fk_userId',
        columns: [table.userId],
        foreignColumns: [Users.id]
      }).onDelete('cascade'),

      userIdIndex: index('idx_userId').on(table.userId)
    };
  }
);
export type Post = typeof Posts.$inferSelect;
