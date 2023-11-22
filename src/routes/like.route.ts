import { toggleLikeOnPostOrComment } from '@/config/like.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();

router.route('/like/:id').put(isAuthenticatedUser, toggleLikeOnPostOrComment);
