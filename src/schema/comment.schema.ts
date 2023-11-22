import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { Posts } from './post.schema';
import { Users } from './user.schema';

export const Comments = pgTable(
  'comments',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    comment: text('comment').notNull(),
    userId: text('userId').notNull(),
    postId: text('postId').notNull(),
    parentCommentId: text('parentCommentId'),
    createdAt: timestamp('createdAt', { mode: 'string' }).defaultNow()
  },
  function constraints(table) {
    return {
      userReference: foreignKey({
        name: 'fk_userId',
        columns: [table.userId],
        foreignColumns: [Users.id]
      }).onDelete('cascade'),

      postReference: foreignKey({
        name: 'fk_postId',
        columns: [table.postId],
        foreignColumns: [Posts.id]
      }).onDelete('cascade'),

      parentCommentReference: foreignKey({
        name: 'fk_parentCommentId',
        columns: [table.parentCommentId],
        foreignColumns: [table.id]
      }).onDelete('cascade'),

      userIdIndex: index('idx_userId').on(table.userId),
      postIdIndex: index('idx_postId').on(table.postId),
      parentCommentIdIndex: index('idx_parentCommentId').on(
        table.parentCommentId
      )
    };
  }
);
export type Comment = typeof Comments.$inferSelect;
