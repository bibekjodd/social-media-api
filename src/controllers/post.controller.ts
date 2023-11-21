import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Posts } from '@/schema/post.schema';
import { desc, eq } from 'drizzle-orm';

type GetPostsQuery = {
  page?: string;
  pageSize?: string;
  userId?: string;
};
export const getPosts = catchAsyncError<
  unknown,
  unknown,
  unknown,
  GetPostsQuery
>(async (req, res) => {
  let page = Number(req.query.page) || 1;
  let pageSize = Number(req.query.pageSize) || 20;
  if (page < 1) page = 1;
  if (pageSize < 1) pageSize = 1;
  if (pageSize > 50) pageSize = 20;
  const offset = (page - 1) * pageSize;

  const userId = req.query.userId;

  const query = db
    .select()
    .from(Posts)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(Posts.createdAt));
  if (!userId) {
    const posts = await query;
    return res.json({ posts });
  }

  const posts = await query.where(eq(Posts.userId, req.user.id));
  return res.json({ posts });
});

type CreatePostBody = { caption?: string; image?: string };
export const createPost = catchAsyncError<unknown, unknown, CreatePostBody>(
  async (req, res, next) => {
    const { image, caption } = req.body;
    if (!image && !caption) {
      return next(
        new CustomError('One of caption or image is required to create post')
      );
    }

    const [post] = await db
      .insert(Posts)
      .values({ userId: req.user.id, image, caption })
      .returning();

    if (!post) return next(new CustomError('Could not create post'));
    return res.json({ post });
  }
);
