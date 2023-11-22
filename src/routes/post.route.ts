import {
  createPost,
  deletePost,
  getPostDetails,
  getPosts,
  updatePost
} from '@/controllers/post.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();
router.get('/posts', getPosts);
router.post('/post', isAuthenticatedUser, createPost);
router
  .route('/post/:id')
  .get(getPostDetails)
  .put(isAuthenticatedUser, updatePost)
  .delete(isAuthenticatedUser, deletePost);
