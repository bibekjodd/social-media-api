import {
  getLikesFromPostOrComment,
  hasLiked,
  likeOnPostOrComment
} from '@/config/like.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();

router
  .route('/like/:id')
  .get(hasLiked)
  .put(isAuthenticatedUser, likeOnPostOrComment);
router.route('/likes/:id').get(getLikesFromPostOrComment);
