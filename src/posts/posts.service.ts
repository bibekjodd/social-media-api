import { db } from '@/config/database';
import { comments } from '@/schemas/comment.schema';
import { likes } from '@/schemas/like.schema';
import { Post, posts, selectPostSnapshot } from '@/schemas/post.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { BadRequestException, Injectable } from '@nestjs/common';
import { and, desc, eq, isNull, sql } from 'drizzle-orm';
import { CreatePostSchema, PostsQuerySchema } from './post.dto';

@Injectable()
export class PostsService {
  async getPosts(query: PostsQuerySchema, userId: string | undefined) {
    const offset = (query.page - 1) * query.page_size;

    const resultQuery = db
      .select({
        ...selectPostSnapshot,
        author: selectUserSnapshot,
        totalLikes: sql<number>`cast(count(distinct(${likes.id})) as int)`,
        totalComments: sql<number>`cast(count(distinct(${comments.id})) as int)`,
        hasLiked: !userId
          ? sql<boolean>`false`
          : sql<number>`cast(count(distinct(
        case
          when ${userId}=${likes.userId} then 1
          else null
        end
      )) as int)`
      })
      .from(posts)
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .leftJoin(comments, eq(posts.id, comments.postId))
      .limit(query.page_size)
      .offset(offset)
      .orderBy(desc(posts.createdAt))
      .groupBy(posts.id, users.id);

    let result: undefined | Awaited<typeof resultQuery> = undefined;
    if (!query.author) {
      result = await resultQuery;
    } else {
      result = await resultQuery.where(eq(posts.authorId, query.author));
    }
    result = result.map((post) => ({ ...post, hasLiked: !!post.hasLiked }));
    return { posts: result };
  }

  async createPost(
    data: CreatePostSchema,
    authorId: string
  ): Promise<{ post: Post }> {
    const [createdPost] = await db
      .insert(posts)
      .values({ authorId, caption: data.caption, image: data.image })
      .returning();

    return { post: createdPost };
  }

  async getPost(postId: string, userId: string | undefined) {
    const [post] = await db
      .select({
        id: posts.id,
        caption: posts.caption,
        image: posts.image,
        createdAt: posts.createdAt,
        author: selectUserSnapshot,
        totalLikes: sql<number>`cast(count(distinct(${likes.id})) as int)`,
        totalComments: sql<number>`cast(count(distinct(${comments.id})) as int)`,
        hasLiked: !userId
          ? sql<boolean>`false`
          : sql<number>`cast(count(distinct(
          case
            when ${userId}=${likes.userId} then 1
            else null
          end
        )) as int)`
      })
      .from(posts)
      .where(eq(posts.id, postId))
      .leftJoin(users, eq(posts.authorId, users.id))
      .leftJoin(likes, eq(posts.id, likes.postId))
      .leftJoin(
        comments,
        and(eq(posts.id, comments.postId), isNull(comments.parentCommentId))
      )
      .groupBy(posts.id, users.id);

    if (!post) {
      throw new BadRequestException('Post does not exist');
    }

    return { post };
  }

  async updatePost(
    postId: string,
    authorId: string,
    data: CreatePostSchema
  ): Promise<{ post: Post }> {
    const [updatedPost] = await db
      .update(posts)
      .set(data)
      .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
      .returning(selectPostSnapshot);

    if (!updatedPost) {
      throw new BadRequestException('Post does not exist');
    }

    return { post: updatedPost };
  }

  async deletePost(postId: string, authorId: string) {
    const [post] = await db
      .delete(posts)
      .where(and(eq(posts.id, postId), eq(posts.authorId, authorId)))
      .returning();
    if (!post) {
      throw new BadRequestException(
        'Post already deleted or you are not the author of this post'
      );
    }
    return { message: 'Post deleted successfully' };
  }
}
