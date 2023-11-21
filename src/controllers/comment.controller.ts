import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Comments } from '@/schema/comment.schema';

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
  if (!comment) return next(new CustomError("Comment can't be null"));
  if (!postId) return next(new CustomError('Post id is not provided'));

  const [createdComment] = await db
    .insert(Comments)
    .values({ comment, postId, userId: req.user.id, parentCommentId })
    .returning();

  return res.json({
    message: 'Comment posted successfully',
    comment: createdComment
  });
});
