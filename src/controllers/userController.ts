import { catchAsyncError } from "../middlewares/catchAsyncError";
import User from "../models/User";
import { ErrorHandler } from "../utils/errorHandler";

type CreateUserBody = {
  name: string;
  email: string;
  password: string;
};
export const createUser = catchAsyncError<unknown, unknown, CreateUserBody>(
  async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return next(new ErrorHandler("Please fill all the fields", 400));

    const user = await User.findOne({ email });
    if (user)
      return next(new ErrorHandler("User with same email already exists", 409));

    const newUser = await User.create({ name, email, password });
    res.status(201).json({
      user: newUser,
    });
  }
);

type LoginBody = {
  email: string;
  password: string;
};

export const login = catchAsyncError<unknown, unknown, LoginBody>(
  async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ErrorHandler("Please fill all the fields", 400));

    const user = await User.findOne({ email }).select("+password");
    if (!user) return next(new ErrorHandler("Invalid user credintials", 404));

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return next(new ErrorHandler("Invalid user credintials", 400));

    res.status(200).json({ user });
  }
);

export const myProfile = catchAsyncError(async (req, res) => {
  // use middleware before this
  const user = await User.findById(req.user._id);
  res.status(200).json({
    user,
  });
});
