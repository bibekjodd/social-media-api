import { Comments } from '@/schema/comment.schema';
import { Likes } from '@/schema/like.schema';
import { Posts } from '@/schema/post.schema';
import { Users } from '@/schema/user.schema';

export const userSnapshot = {
  id: Users.id,
  name: Users.name,
  email: Users.email,
  image: Users.image,
  createdAt: Users.createdAt
};

export const postSnapshot = {
  id: Posts.id,
  caption: Posts.caption,
  image: Posts.image,
  userId: Posts.userId,
  createdAt: Posts.createdAt
};

export const commentSnapshot = {
  id: Comments.id,
  comment: Comments.comment,
  userId: Comments.userId,
  postId: Comments.postId,
  parentCommentId: Comments.parentCommentId,
  createdAt: Comments.createdAt
};

export const likeSnapshot = {
  id: Likes.id,
  postId: Likes.postId,
  commentId: Likes.commentId,
  createdAt: Likes.createdAt,
  userId: Likes.userId
};
