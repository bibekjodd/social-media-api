import { createId } from '@paralleldrive/cuid2';
import {
  foreignKey,
  index,
  pgTable,
  text,
  timestamp
} from 'drizzle-orm/pg-core';
import { Comments } from './comment.schema';
import { Posts } from './post.schema';
import { Users } from './user.schema';

export const Likes = pgTable(
  'likes',
  {
    id: text('id')
      .notNull()
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: text('userId').notNull(),
    postId: text('postId'),
    commentId: text('commentId'),
    createdAt: timestamp('createdAt').notNull().defaultNow()
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

      commentReference: foreignKey({
        name: 'fk_commentId',
        columns: [table.commentId],
        foreignColumns: [Comments.id]
      }).onDelete('cascade'),

      userIdIndex: index('idx_userId').on(table.userId),
      postIdIndex: index('idx_postId').on(table.postId),
      commentIdIndex: index('idx_commentId').on(table.commentId)
    };
  }
);
export type Like = typeof Likes.$inferSelect;
