import mongoose, { Types } from "mongoose";
import bcrypt from "bcryptjs";
import validator from "validator";

export type UserSchema = {
  _id: Types.ObjectId;
  createdAt: NativeDate;
  updatedAt: NativeDate;
  name: string;
  email: string;
  password?: string;
};

export type TUser = Omit<UserSchema, "_id" | "createdAt" | "updatedAt"> & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

type UserMethods = {
  comparePassword: (password: string) => Promise<boolean>;
};

const userSchema = new mongoose.Schema<
  UserSchema,
  mongoose.Model<UserSchema>,
  UserMethods
>(
  {
    name: {
      type: String,
      required: [true, "Name is mandatory field"],
      trim: true,
      minlength: [4, "Name must be at least 4 characters"],
      maxlength: [30, "Name should not exceed 30 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is mandatory field"],
      trim: true,
      validate: (email: string) => {
        if (!validator.isEmail(email)) {
          throw new Error("Please provide valid email!");
        }
      },
    },

    password: {
      type: String,
      required: [true, "Password is mandatory field"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
      maxlength: [12, "Password should not exceed 12 characters"],
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password || "", 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  const isMatch = await bcrypt.compare(password, this.password);
  return isMatch;
};

const User = mongoose.model("User", userSchema);
export default User;
