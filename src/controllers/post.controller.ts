import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Posts } from '@/schema/post.schema';

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
