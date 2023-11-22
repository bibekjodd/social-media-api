import {
  getLikesFromPostOrComment,
  toggleLikeOnPostOrComment
} from '@/config/like.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();

router
  .route('/like/:id')
  .get(getLikesFromPostOrComment)
  .put(isAuthenticatedUser, toggleLikeOnPostOrComment);
