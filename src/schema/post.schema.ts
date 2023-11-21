import { createId } from '@paralleldrive/cuid2';
import { date, foreignKey, index, pgTable, text } from 'drizzle-orm/pg-core';
import { Users } from './user.schema';

export const Posts = pgTable(
  'posts',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    title: text('title'),
    image: text('image'),
    userId: text('userId').notNull(),
    createdAt: date('createdAt', { mode: 'string' }).notNull().defaultNow()
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
