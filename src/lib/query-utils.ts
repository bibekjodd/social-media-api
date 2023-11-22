import { Comments } from '@/schema/comment.schema';
import { Likes } from '@/schema/like.schema';
import { Posts } from '@/schema/post.schema';
import { Users } from '@/schema/user.schema';

export const selectUserSnapshot = {
  id: Users.id,
  name: Users.name,
  email: Users.email,
  image: Users.email
};

export const selectPostSnapshot = {
  id: Posts.id,
  caption: Posts.caption,
  image: Posts.image,
  userId: Posts.userId,
  createdAt: Posts.createdAt
};

export const selectCommentSnapshot = {
  id: Comments.id,
  comment: Comments.comment,
  userId: Comments.userId,
  postId: Comments.postId,
  parentCommentId: Comments.parentCommentId,
  createdAt: Comments.createdAt
};

export const selectLikeSnapshot = {
  id: Likes.id,
  postId: Likes.postId,
  commentId: Likes.commentId,
  createdAt: Likes.createdAt,
  userId: Likes.userId
};
