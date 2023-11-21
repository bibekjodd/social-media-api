import { createPost, getPosts } from '@/controllers/post.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import { Router } from 'express';

export const router = Router();
router.get('/posts', getPosts);
router.post('/create-post', isAuthenticatedUser, createPost);
