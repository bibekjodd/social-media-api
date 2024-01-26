import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { posts } from './post.schema';
import { users } from './user.schema';

export const comments = pgTable(
  'comments',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    comment: text('comment').notNull(),
    userId: text('user_id').notNull(),
    postId: text('post_id').notNull(),
    parentCommentId: text('parent_comment_id'),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow()
  },
  function constraints(table) {
    return {
      userReference: foreignKey({
        name: 'fk_user_id',
        columns: [table.userId],
        foreignColumns: [users.id]
      }).onDelete('cascade'),

      postReference: foreignKey({
        name: 'fk_post_id',
        columns: [table.postId],
        foreignColumns: [posts.id]
      }).onDelete('cascade'),

      parentCommentReference: foreignKey({
        name: 'fk_parent_comment_id',
        columns: [table.parentCommentId],
        foreignColumns: [table.id]
      }).onDelete('cascade'),

      userIdIndex: index('comments_idx_user_id').on(table.userId),
      postIdIndex: index('comments_idx_post_id').on(table.postId),
      parentCommentIdIndex: index('comments_idx_parent_comment_id').on(
        table.parentCommentId
      )
    };
  }
);
export type Comment = typeof comments.$inferSelect;
