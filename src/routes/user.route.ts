import {
  deleteProfile,
  getUserProfile,
  loginUser,
  registerUser,
  updatePassword,
  updateProfile
} from '@/controllers/user.controller';
import { isAuthenticatedUser } from '@/middlewares/auth';
import express from 'express';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router
  .route('/profile')
  .get(isAuthenticatedUser, getUserProfile)
  .put(isAuthenticatedUser, updateProfile)
  .delete(isAuthenticatedUser, deleteProfile);

router.route('/password').put(isAuthenticatedUser, updatePassword);

export default router;
