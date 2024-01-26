import {
  deleteComment,
  editComment,
  getComments,
  postComment
} from '@/controllers/comment.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();
router.route('/comments/:id').get(getComments);
router
  .route('/comment/:id')
  .post(isAuthenticatedUser, postComment)
  .put(isAuthenticatedUser, editComment)
  .delete(isAuthenticatedUser, deleteComment);
