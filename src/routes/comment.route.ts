import { getComments, postComment } from '@/controllers/comment.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();
router.post('/comment', isAuthenticatedUser, postComment);
router.route('/comment/:id').get(getComments);
