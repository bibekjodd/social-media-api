import express from 'express';
import { createUser, getAllUsers } from '../controllers/user.controller';

const router = express.Router();

router.get('/users', getAllUsers);
router.post('/register', createUser);

export default router;
