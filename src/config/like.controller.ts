import { CustomError } from '@/lib/custom-error';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Comments } from '@/schema/comment.schema';
import { Likes } from '@/schema/like.schema';
import { Posts } from '@/schema/post.schema';
import { and, eq } from 'drizzle-orm';
import { db } from './database';

export const toggleLikeOnPostOrComment = catchAsyncError<
  { id: string },
  unknown,
  unknown,
  { isPost?: 'true' }
>(async (req, res, next) => {
  const postOrCommentId = req.params.id;
  const isPost = req.query.isPost === 'true';

  const [postOrCommentExists] = await db
    .select()
    .from(isPost ? Posts : Comments)
    .where(eq(isPost ? Posts.id : Comments.id, postOrCommentId));

  if (!postOrCommentExists) {
    return next(
      new CustomError(
        `${isPost ? "Post doesn't exist" : "Comment doesn't exist"}`
      )
    );
  }

  const [liked] = await db
    .select()
    .from(Likes)
    .where(
      and(
        eq(isPost ? Likes.postId : Likes.commentId, postOrCommentId),
        eq(Likes.userId, req.user.id)
      )
    );

  if (liked) {
    await db.delete(Likes).where(eq(Likes.id, liked.id));
  } else {
    await db.insert(Likes).values({
      userId: req.user.id,
      postId: isPost ? postOrCommentId : undefined,
      commentId: isPost ? undefined : postOrCommentId
    });
  }

  return res.json({ liked: !liked });
});
