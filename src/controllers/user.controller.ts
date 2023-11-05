import { CustomError } from '../lib/custom-error';
import { catchAsyncError } from '../middlewares/catch-async-error';

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
  avatar: string;
};
export const createUser = catchAsyncError<unknown, unknown, CreateUserBody>(
  async (req, res, next) => {
    const { name, email, password, avatar } = req.body;
    if (!name || !email || !password || !avatar) {
      return next(new CustomError('Please fill all the fields'));
    }

    return res.json({ message: 'user created successfully' });
  }
);

export const getAllUsers = catchAsyncError(async (req, res) => {
  return res.json({ users: ['elon', 'obama'] });
});
