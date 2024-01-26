import { db } from '@/config/database';
import {
  Comment,
  comments,
  selectCommentSnapshot
} from '@/schemas/comment.schema';
import { likes } from '@/schemas/like.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { QueryCommentsSchema } from './comment.dto';

@Injectable()
export class CommentsService {
  async addComment(data: {
    postId: string;
    comment: string;
    userId: string;
    parentCommentId: string | null;
  }): Promise<{ comment: Comment }> {
    const [createdComment] = await db
      .insert(comments)
      .values({
        comment: data.comment.trim(),
        postId: data.postId,
        userId: data.userId,
        parentCommentId: data.parentCommentId
      })
      .returning();
    if (!createdComment) {
      throw new BadRequestException('Could not add comment');
    }
    return { comment: createdComment };
  }

  async getComments({
    page,
    page_size,
    parent_comment_id,
    postId,
    userId
  }: { postId: string; userId?: string } & QueryCommentsSchema) {
    const offset = (page - 1) * page_size;

    const Replies = alias(comments, 'replies');
    let result = await db
      .select({
        ...selectCommentSnapshot,
        totalLikes: sql<number>`cast(count(distinct(${likes.id})) as int)`,
        totalReplies: sql<number>`cast(count(distinct(${Replies.id})) as int)`,
        hasLiked: !userId
          ? sql<boolean>`false`
          : sql<number>`cast(count(distinct(
        case
          when ${userId}=${likes.userId} then 1
          else null
          end
      )) as int)`,
        user: selectUserSnapshot
      })
      .from(comments)
      .where(
        and(
          eq(comments.postId, postId),
          parent_comment_id
            ? eq(comments.parentCommentId, parent_comment_id)
            : isNull(comments.parentCommentId)
        )
      )
      .limit(page_size)
      .offset(offset)
      .orderBy(
        parent_comment_id ? asc(comments.createdAt) : desc(comments.createdAt)
      )
      .leftJoin(users, eq(comments.userId, users.id))
      .leftJoin(likes, eq(likes.commentId, comments.id))
      .leftJoin(Replies, eq(comments.id, Replies.parentCommentId))
      .groupBy(comments.id, users.id);

    result = result.map((comment) => ({
      ...comment,
      hasLiked: !!comment.hasLiked
    }));
    return { comments: result };
  }

  async editComment({
    commentId,
    comment,
    userId
  }: {
    userId: string;
    commentId: string;
    comment: string;
  }) {
    const [updatedComment] = await db
      .update(comments)
      .set({ comment: comment.trim() })
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning();

    if (!updatedComment) {
      throw new BadRequestException(
        "Comment doesn't exist or comment doesn't belong to you"
      );
    }
    return { comment: updatedComment };
  }

  async deleteComment(userId: string, commentId: string) {
    const [comment] = await db
      .delete(comments)
      .where(and(eq(comments.id, commentId), eq(comments.userId, userId)))
      .returning({ id: comments.id });

    if (!comment) {
      throw new BadRequestException(
        "Comment doesn't exist or comment doesn't belong to you"
      );
    }
    return { message: 'Comment deleted successfully' };
  }
}
