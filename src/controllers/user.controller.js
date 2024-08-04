import bcrypt from 'bcrypt';
import { NEW_REQUEST, REFETCH_CHATS } from '../constants/event.js';
import { TryCatch } from '../middlewares/error.middleware.js';
import { Chat } from '../models/chat.model.js';
import { Request } from '../models/request.model.js';
import { User } from '../models/user.model.js';
import { cookieOptions, emitEvent, sendToken } from '../utils/features.js';
import { ErrorHandler } from '../utils/utility.js';
import { getOtherMember } from '../../lib/helper.js';
import { uploadFilesToCloudinary } from '../utils/cloudinary.js';

// Create a new user and save it to the database and save in cookie
const newUser = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;
  const file = req.file;

  if (!file) {
    return next(new ErrorHandler('Please Upload Avatar', 404));
  }

  const result = await uploadFilesToCloudinary([file]);

  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };

  const user = await User.create({
    name,
    bio,
    username,
    password,
    avatar,
  });

  sendToken(res, user, 201, 'User created');
});

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

const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);

  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  res.status(200).json({
    success: true,
    user,
  });
});

const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie('chatify-token', '', { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: 'Logged out successfully',
    });
});

const searchUser = TryCatch(async (req, res) => {
  const { name = '' } = req.query;

  // Finding All my chats
  const myChats = await Chat.find({ groupChat: false, members: req.user });

  // extracting All users from my chats means friends or people I have chatted with
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  // finding all users except me and friends
  const allUsersExceptMeandFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: 'i' },
  });

  // Modifying the response
  const users = allUsersExceptMeandFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));

  return res.status(200).json({
    success: true,
    users,
  });
});

const sendFriendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;

  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });

  if (request) {
    return next(new ErrorHandler('Request already sent', 400));
  }

  await Request.create({
    sender: req.user,
    receiver: userId,
  });

  emitEvent(req, NEW_REQUEST, [userId]);

  return res.status(200).json({
    success: true,
    message: 'Freind Request Sent',
  });
});

const acceptFriendRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;

  const request = await Request.findById(requestId)
    .populate('sender', 'name')
    .populate('receiver', 'name');

  if (!request) {
    return next(new ErrorHandler('Request not found', 404));
  }

  if (request.receiver._id.toString() !== req.user.toString()) {
    return next(
      new ErrorHandler('You are not authorized to accept this request', 401)
    );
  }

  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({
      success: true,
      message: 'Friend Request Rejected',
    });
  }

  const members = [request.sender._id, request.receiver._id];

  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);

  emitEvent(req, REFETCH_CHATS, members);

  return res.status(200).json({
    success: true,
    message: 'Freind Request Accepted',
    senderId: request.sender._id,
  });
});

const getMyNotifications = TryCatch(async (req, res) => {
  const requests = await Request.find({ receiver: req.user }).populate(
    'sender',
    'name avatar'
  );

  const allRequests = requests.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});

const getMyFriends = TryCatch(async (req, res) => {
  const chatId = req.query.chatId;

  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate('members', 'name avatar');

  const friends = chats.map(({ members }) => {
    const otherUser = getOtherMember(members, req.user);

    return {
      _id: otherUser._id,
      name: otherUser.name,
      avatar: otherUser.avatar.url,
    };
  });

  if (chatId) {
    const chat = await Chat.findById(chatId);

    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );

    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});

export {
  acceptFriendRequest,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
  getMyFriends,
};
