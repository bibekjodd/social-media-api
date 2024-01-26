import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { comments } from './comment.schema';
import { posts } from './post.schema';
import { users } from './user.schema';

export const likes = pgTable(
  'likes',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('user_id').notNull(),
    postId: text('post_id'),
    commentId: text('comment_id'),
    createdAt: timestamp('created_at').notNull().defaultNow()
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

      commentReference: foreignKey({
        name: 'fk_comment_id',
        columns: [table.commentId],
        foreignColumns: [comments.id]
      }).onDelete('cascade'),

      userIdIndex: index('likes_idx_user_id').on(table.userId),
      postIdIndex: index('likes_idx_post_id').on(table.postId),
      commentIdIndex: index('likes_idx_comment_id').on(table.commentId)
    };
  }
);
export type Like = typeof likes.$inferSelect;
export const selectLikeSnapshot = {
  id: likes.id,
  postId: likes.postId,
  commentId: likes.commentId,
  createdAt: likes.createdAt,
  userId: likes.userId
};
export type LikeSnapshot = {
  id: string;
  postId: string | null;
  commentId: string | null;
  createdAt: string;
  userId: string;
};
