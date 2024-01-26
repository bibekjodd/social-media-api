import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { commentSnapshot, userSnapshot } from '@/lib/select-snapshots';
import { decodeCookieToken } from '@/lib/utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Comments } from '@/schema/comment.schema';
import { Likes } from '@/schema/like.schema';
import { Users } from '@/schema/user.schema';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export const postComment = catchAsyncError<
  { id: string },
  unknown,
  { comment?: string },
  { parentCommentId?: string }
>(async (req, res, next) => {
  const postId = req.params.id;
  const { comment } = req.body;
  const { parentCommentId } = req.query;
  if (!comment) return next(new CustomError("Comment can't be empty"));

  const [createdComment] = await db
    .insert(Comments)
    .values({
      comment: comment.trim(),
      postId,
      userId: req.user.id,
      parentCommentId: parentCommentId || null
    })
    .returning();

  return res.json({
    message: 'Comment posted successfully',
    comment: createdComment
  });
});

type GetCommentsQuery = {
  parentCommentId?: string;
  page?: string;
  pageSize?: string;
};
export const getComments = catchAsyncError<
  { id: string },
  unknown,
  unknown,
  GetCommentsQuery
>(async (req, res) => {
  const postId = req.params.id;
  const parentCommentId = req.query.parentCommentId;
  const userId = decodeCookieToken(req.cookies?.token);
  let page = Number(req.query.page) || 1;
  if (page < 1) page = 1;
  let pageSize = Number(req.query.pageSize) || 10;
  if (pageSize < 1 || pageSize > 20) pageSize = 10;
  const offset = (page - 1) * pageSize;

  const Replies = alias(Comments, 'replies');
  let comments = await db
    .select({
      ...commentSnapshot,
      totalLikes: sql<number>`cast(count(distinct(${Likes.id})) as int)`,
      totalReplies: sql<number>`cast(count(distinct(${Replies.id})) as int)`,
      hasLiked: !userId
        ? sql<boolean>`false`
        : sql<number>`cast(count(distinct(
        case
          when ${userId}=${Likes.userId} then 1
          else null
          end
      )) as int)`,
      user: userSnapshot
    })
    .from(Comments)
    .where(
      and(
        eq(Comments.postId, postId),
        parentCommentId
          ? eq(Comments.parentCommentId, parentCommentId)
          : isNull(Comments.parentCommentId)
      )
    )
    .limit(pageSize)
    .offset(offset)
    .orderBy(
      parentCommentId ? asc(Comments.createdAt) : desc(Comments.createdAt)
    )
    .leftJoin(Users, eq(Comments.userId, Users.id))
    .leftJoin(Likes, eq(Likes.commentId, Comments.id))
    .leftJoin(Replies, eq(Comments.id, Replies.parentCommentId))
    .groupBy(Comments.id, Users.id);

  comments = comments.map((comment) => ({
    ...comment,
    hasLiked: !!comment.hasLiked
  }));
  return res.json({ total: comments.length, comments });
});

export const editComment = catchAsyncError<
  { id: string },
  unknown,
  { comment?: string }
>(async (req, res, next) => {
  const commentId = req.params.id;
  const { comment } = req.body;
  if (!comment) {
    return next(new CustomError("Comment can't be empty"));
  }

  const [updatedComment] = await db
    .update(Comments)
    .set({ comment: comment.trim() })
    .where(and(eq(Comments.id, commentId), eq(Comments.userId, req.user.id)))
    .returning();

  if (!updatedComment) {
    return next(
      new CustomError("Comment doesn't exist or comment doesn't belong to you")
    );
  }

  return res.json({ comment: updatedComment });
});

export const deleteComment = catchAsyncError<{ id: string }>(
  async (req, res, next) => {
    const commentId = req.params.id;

    const [comment] = await db
      .delete(Comments)
      .where(and(eq(Comments.id, commentId), eq(Comments.userId, req.user.id)))
      .returning({ id: Comments.id });

    if (!comment) {
      return next(
        new CustomError(
          "Comment doesn't exist or comment doesn't belong to you"
        )
      );
    }

    return res.json({ message: 'Comment deleted successfully' });
  }
);
