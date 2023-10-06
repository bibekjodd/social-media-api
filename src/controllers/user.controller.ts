import { catchAsyncError } from "../middlewares/catchAsyncError";
import User from "../models/user.model";
import { CustomError } from "../lib/customError";

type CreateUserBody = Partial<{
  name: string;
  email: string;
  password: string;
}>;
export const createUser = catchAsyncError<unknown, unknown, CreateUserBody>(
  async (req, res) => {
    const { name, email, password } = req.body;

    const user = await User.findOne({ email });
    if (user) throw new CustomError("User with same email already exists", 409);
    const newUser = await User.create({ name, email, password });
    return res.status(201).json({
      user: newUser,
    });
  }
);

type LoginUserBody = Omit<CreateUserBody, "name">;
export const login = catchAsyncError<unknown, unknown, LoginUserBody>(
  async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new CustomError("Invalid user credintials", 404);

    const isMatch = await user.comparePassword(password || "");
    if (!isMatch) throw new CustomError("Invalid user credintials", 400);

    return res.json({ user });
  }
);

// use middleware before this
export const myProfile = catchAsyncError(async (req, res) => {
  const user = await User.findById(req.user._id);
  return res.json({
    user,
  });
});
