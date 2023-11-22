import {
  deleteComment,
  editComment,
  getComments,
  postComment
} from '@/controllers/comment.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();
router
  .route('/comment/:id')
  .get(getComments)
  .post(isAuthenticatedUser, postComment)
  .put(isAuthenticatedUser, editComment)
  .delete(isAuthenticatedUser, deleteComment);
