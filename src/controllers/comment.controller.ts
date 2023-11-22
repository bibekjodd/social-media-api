import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { selectCommentSnapshot, selectUserSnapshot } from '@/lib/query-utils';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Comments } from '@/schema/comment.schema';
import { Users } from '@/schema/user.schema';
import { and, asc, desc, eq, isNull } from 'drizzle-orm';

type PostCommentBody = {
  comment?: string;
};
type PostCommentQuery = { postId?: string; parentCommentId?: string };
export const postComment = catchAsyncError<
  unknown,
  unknown,
  PostCommentBody,
  PostCommentQuery
>(async (req, res, next) => {
  const { comment } = req.body;
  const { parentCommentId, postId } = req.query;
  if (!comment) return next(new CustomError("Comment can't be empty"));
  if (!postId) return next(new CustomError('Post id is not provided'));

  const [createdComment] = await db
    .insert(Comments)
    .values({
      comment: comment.trim(),
      postId,
      userId: req.user.id,
      parentCommentId
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
  let page = Number(req.query.page) || 1;
  if (page < 1) page = 1;
  let limit = Number(req.query.pageSize) || 10;
  if (limit < 1 || limit > 20) limit = 10;
  const offset = (page - 1) * limit;

  const comments = await db
    .select({ ...selectCommentSnapshot, user: selectUserSnapshot })
    .from(Comments)
    .where(
      and(
        eq(Comments.postId, postId),
        parentCommentId
          ? eq(Comments.parentCommentId, parentCommentId)
          : isNull(Comments.parentCommentId)
      )
    )
    .limit(limit)
    .offset(offset)
    .orderBy(
      parentCommentId ? asc(Comments.createdAt) : desc(Comments.createdAt)
    )
    .leftJoin(Users, eq(Comments.userId, Users.id));

  return res.json({ total: comments.length, comments });
});
