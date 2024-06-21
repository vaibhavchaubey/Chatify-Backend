import bcrypt from 'bcrypt';
import { User } from '../models/user.model.js';
import { cookieOptions, sendToken } from '../utils/features.js';
import { TryCatch } from '../middlewares/error.middleware.js';
import { ErrorHandler } from '../utils/utility.js';
import { Chat } from '../models/chat.model.js';

// Create a new user and save it to the database and save in cookie
const newUser = async (req, res) => {
  const { name, username, password, bio } = req.body;

  const avatar = {
    public_id: 'vrwevrwefre',
    url: 'fdwfgwre',
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, 'User created');
};

// Login user and save token in cookie
const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username }).select('+password');

  if (!user) {
    return next(new ErrorHandler('Invalid Username or Password', 404));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(new ErrorHandler('Invalid Username or Password', 404));
  }

  sendToken(res, user, 201, `Welcome Back, ${user.name}`);
});

const getMyProfile = TryCatch(async (req, res) => {
  const user = await User.findById(req.user);

  res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res) => {
  return res
    .status(200)
    .cookie('chatify-token', '', { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      messaage: 'Logged out successfully',
    });
});

const searchUser = TryCatch(async (req, res) => {
  const { name } = req.query;

  const myChats = Chat.find({ groupChat: false, members: req.user });
  

  return res.status(200).json({
    success: true,
    messaage: name,
  });
});

export { newUser, login, getMyProfile, logout, searchUser };
