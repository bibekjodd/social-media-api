import { db } from '@/config/database';
import { CustomError } from '@/lib/custom-error';
import { validateImageUrl } from '@/lib/validators';
import { catchAsyncError } from '@/middlewares/catch-async-error';
import { Posts } from '@/schema/post.schema';
import { Users } from '@/schema/user.schema';
import { and, desc, eq } from 'drizzle-orm';

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
    .select({
      id: Posts.id,
      caption: Posts.caption,
      image: Posts.image,
      createdAt: Posts.createdAt,
      author: {
        id: Users.id,
        name: Users.name,
        email: Users.email,
        image: Users.image
      }
    })
    .from(Posts)
    .leftJoin(Users, eq(Posts.userId, Users.id))
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(Posts.createdAt));

  if (!userId) {
    const posts = await query;
    return res.json({ total: posts.length, posts });
  }

  const posts = await query.where(eq(Posts.userId, userId));
  return res.json({ total: posts.length, posts });
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
    validateImageUrl(image);

    const [post] = await db
      .insert(Posts)
      .values({
        userId: req.user.id,
        image: image?.trim(),
        caption: caption?.trim()
      })
      .returning();

    if (!post) return next(new CustomError('Could not create post'));
    return res.json({ post });
  }
);

export const getPostDetails = catchAsyncError<{ id: string }>(
  async (req, res, next) => {
    const postId = req.params.id;
    const [post] = await db
      .select({
        id: Posts.id,
        caption: Posts.caption,
        image: Posts.image,
        createdAt: Posts.createdAt,
        user: {
          id: Users.id,
          name: Users.name,
          email: Users.email,
          image: Users.image
        }
      })
      .from(Posts)
      .where(eq(Posts.id, postId))
      .leftJoin(Users, eq(Posts.userId, Users.id));

    if (!post) return next(new CustomError('Post not found'));

    return res.json({ post });
  }
);

type UpdatePostBody = {
  caption?: string;
  image?: string;
};
export const updatePost = catchAsyncError<
  { id: string },
  unknown,
  UpdatePostBody
>(async (req, res, next) => {
  const postId = req.params.id;
  const [post] = await db
    .select()
    .from(Posts)
    .where(and(eq(Posts.id, postId), eq(Posts.userId, req.user.id)));

  if (!post) {
    return next(
      new CustomError(
        "Post doesn't exist or you are not the author of the post"
      )
    );
  }

  const { caption, image } = req.body;
  validateImageUrl(image);
  if (!image && !caption) {
    return next(
      new CustomError('Please provide one of caption or image to update post')
    );
  }

  await db
    .update(Posts)
    .set({ image: image?.trim(), caption: caption?.trim() })
    .returning();

  return res.json({ message: 'Post updated successfully' });
});

export const deletePost = catchAsyncError<{ id: string }>(
  async (req, res, next) => {
    const postId = req.params.id;
    const [post] = await db
      .delete(Posts)
      .where(and(eq(Posts.id, postId), eq(Posts.userId, req.user.id)))
      .returning({ id: Posts.id });

    if (!post) {
      return next(
        new CustomError(
          'Post already deleted or you are not the author of the post'
        )
      );
    }

    return res.json({ message: 'Post deleted successfully' });
  }
);
