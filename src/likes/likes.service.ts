import { db } from '@/config/database';
import { likes, selectLikeSnapshot } from '@/schemas/like.schema';
import { selectUserSnapshot, users } from '@/schemas/user.schema';
import { Injectable } from '@nestjs/common';
import { and, eq, isNull, sql } from 'drizzle-orm';

@Injectable()
export class LikesService {
  async getLikeStatus({
    entityId,
    isPost,
    userId
  }: {
    isPost: boolean;
    userId?: string;
    entityId: string;
  }): Promise<{ totalLikes: number; liked: boolean }> {
    const [result] = await db
      .select({
        count: sql<number>`cast(count(${likes.id}) as int)`
      })
      .from(likes)
      .where(
        and(
          eq(isPost ? likes.postId : likes.commentId, entityId),
          isNull(isPost ? likes.commentId : likes.postId)
        )
      );

    let liked = false;
    if (userId) {
      const [likedRow] = await db
        .select()
        .from(likes)
        .where(
          and(
            eq(likes.userId, userId),
            eq(isPost ? likes.postId : likes.commentId, entityId)
          )
        )
        .limit(1);
      liked = !!likedRow;
    }
    return { liked, totalLikes: result.count || 0 };
  }

  async likeUnlike({
    isPost,
    like,
    userId,
    entityId
  }: {
    isPost: boolean;
    like: boolean;
    userId: string;
    entityId: string;
  }): Promise<{ liked: boolean }> {
    if (!like) {
      await db
        .delete(likes)
        .where(
          and(
            eq(likes.userId, userId),
            eq(isPost ? likes.postId : likes.commentId, entityId),
            isNull(isPost ? likes.commentId : likes.postId)
          )
        );
      return { liked: false };
    }

    const [likeExists] = await db
      .select({ id: likes.id })
      .from(likes)
      .where(
        and(
          eq(likes.userId, userId),
          eq(isPost ? likes.postId : likes.commentId, entityId),
          isNull(isPost ? likes.commentId : likes.postId)
        )
      );

    if (!likeExists) {
      await db.insert(likes).values({
        userId: userId,
        postId: isPost ? entityId : null,
        commentId: isPost ? null : entityId
      });
    }

    return { liked: true };
  }

  async getLikesDetails({
    entityId,
    isPost,
    page,
    pageSize,
    userId
  }: {
    isPost: boolean;
    entityId: string;
    userId: string | undefined;
    page: number;
    pageSize: number;
  }) {
    const offset = (page - 1) * pageSize;
    const result = await db
      .select({
        ...selectLikeSnapshot,
        user: selectUserSnapshot
      })
      .from(likes)
      .where(eq(isPost ? likes.postId : likes.commentId, entityId))
      .leftJoin(users, eq(likes.userId, users.id))
      .limit(pageSize)
      .offset(offset);

    let liked = false;
    if (userId) {
      const [likeExists] = await db
        .select()
        .from(likes)
        .where(
          and(
            eq(isPost ? likes.postId : likes.commentId, entityId),
            eq(likes.userId, userId)
          )
        )
        .limit(1);

      liked = !!likeExists;
    }

    return {
      liked,
      likes: result
    };
  }
}
