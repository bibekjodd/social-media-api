"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.myProfile = exports.login = exports.createUser = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const User_1 = __importDefault(require("../models/User"));
const errorHandler_1 = require("../utils/errorHandler");
exports.createUser = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return next(new errorHandler_1.ErrorHandler("Please fill all the fields", 400));
    const user = await User_1.default.findOne({ email });
    if (user)
        return next(new errorHandler_1.ErrorHandler("User with same email already exists", 409));
    const newUser = await User_1.default.create({ name, email, password });
    res.status(201).json({
        user: newUser,
    });
});
exports.login = (0, catchAsyncError_1.catchAsyncError)(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password)
        return next(new errorHandler_1.ErrorHandler("Please fill all the fields", 400));
    const user = await User_1.default.findOne({ email }).select("+password");
    if (!user)
        return next(new errorHandler_1.ErrorHandler("Invalid user credintials", 404));
    const isMatch = await user.comparePassword(password);
    if (!isMatch)
        return next(new errorHandler_1.ErrorHandler("Invalid user credintials", 400));
    res.status(200).json({ user });
});
exports.myProfile = (0, catchAsyncError_1.catchAsyncError)(async (req, res) => {
    // use middleware before this
    const user = await User_1.default.findById(req.user._id);
    res.status(200).json({
        user,
    });
});
