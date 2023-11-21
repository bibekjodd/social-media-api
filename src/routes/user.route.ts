import {
  deleteProfile,
  forgotPassword,
  getUserProfile,
  loginUser,
  registerUser,
  resetPassword,
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
router.route('/password/forgot').post(forgotPassword);
router.route('/password/reset').put(resetPassword);

export default router;
