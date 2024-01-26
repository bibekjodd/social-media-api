import { likeSnapshot, userSnapshot } from '@/lib/select-snapshots';
import { decodeCookieToken } from '@/lib/utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Likes } from '@/schema/like.schema';
import { Users } from '@/schema/user.schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { db } from './database';

export const hasLiked = catchAsyncError<
  { id: string },
  unknown,
  unknown,
  { isPost?: 'true' }
>(async (req, res) => {
  const isPost = req.query.isPost === 'true';
  const postOrCommentId = req.params.id;
  const userId = decodeCookieToken(req.cookies?.token);

  const [likes] = await db
    .select({
      count: sql<number>`cast(count(${Likes.id}) as int)`
    })
    .from(Likes)
    .where(
      and(
        eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId),
        isNull(isPost ? Likes.commentId : Likes.postId)
      )
    );

  let liked = false;
  if (userId) {
    const [likedRow] = await db
      .select()
      .from(Likes)
      .where(
        and(
          eq(Likes.userId, userId),
          eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId)
        )
      )
      .limit(1);
    liked = !!likedRow;
  }

  return res.json({ totalLikes: likes?.count || 0, liked });
});

export const getLikesFromPostOrComment = catchAsyncError<
  { id: string },
  unknown,
  unknown,
  { isPost?: 'true'; page?: string; pageSize?: string }
>(async (req, res) => {
  const postOrCommentId = req.params.id;
  const isPost = req.query.isPost === 'true';
  const userId = decodeCookieToken(req.cookies?.token);
  let page = Number(req.query.page) || 1;
  if (page < 1) page = 1;
  let pageSize = Number(req.query.pageSize) || 10;
  if (pageSize < 1) pageSize = 10;
  if (pageSize > 10) pageSize = 10;
  const offset = (page - 1) * pageSize;

  const likes = await db
    .select({
      ...likeSnapshot,
      user: userSnapshot
    })
    .from(Likes)
    .where(eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId))
    .leftJoin(Users, eq(Likes.userId, Users.id))
    .limit(pageSize)
    .offset(offset);

  let hasLiked = false;
  if (userId) {
    const [likeExists] = await db
      .select()
      .from(Likes)
      .where(
        and(
          eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId),
          eq(Likes.userId, userId)
        )
      )
      .limit(1);

    hasLiked = !!likeExists;
  }

  return res.json({ hasLiked, likes });
});

export const likeOnPostOrComment = catchAsyncError<
  { id: string },
  unknown,
  unknown,
  { like?: 'true'; isPost?: 'true' }
>(async (req, res) => {
  const postOrCommentId = req.params.id;
  const isPost = req.query.isPost === 'true';
  const like = req.query.like === 'true';

  if (!like) {
    await db
      .delete(Likes)
      .where(
        and(
          eq(Likes.userId, req.user.id),
          eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId),
          isNull(isPost ? Likes.commentId : Likes.postId)
        )
      );
    return res.json({ liked: false });
  }

  const [likeExists] = await db
    .select({ id: Likes.id })
    .from(Likes)
    .where(
      and(
        eq(Likes.userId, req.user.id),
        eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId),
        isNull(isPost ? Likes.commentId : Likes.postId)
      )
    );

  if (!likeExists) {
    await db.insert(Likes).values({
      userId: req.user.id,
      postId: isPost ? postOrCommentId : null,
      commentId: isPost ? null : postOrCommentId
    });
  }

  return res.json({ liked: true });
});
