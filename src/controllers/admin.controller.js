import { TryCatch } from '../middlewares/error.middleware.js';
import { Chat } from '../models/chat.model.js';
import { User } from '../models/user.model.js';
import { Message } from '../models/message.model.js';
import { ErrorHandler } from '../utils/utility.js';
import jwt from 'jsonwebtoken';
import { cookieOptions } from '../utils/features.js';
import { adminSecretKey } from '../index.js';

const adminLogin = TryCatch(async (req, res, next) => {
  const { secretKey } = req.body;

  const isMatched = secretKey === adminSecretKey;

  if (!isMatched) {
    return next(new ErrorHandler('Invalid Admin Key', 401));
  }

  const token = jwt.sign({ secretKey }, process.env.JWT_SECRET);

  return res
    .status(200)
    .cookie('chatify-admin-token', token, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    })
    .json({
      status: true,
      message: 'Admin login successful!',
    });
});

const adminLogout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie('chatify-admin-token', '', { ...cookieOptions, maxAge: 0 })
    .json({
      success: true,
      message: 'Logged Out successfully',
    });
});

const getAdminData = TryCatch(async (req, res) => {
  return res.status(200).json({
    admin: true,
  });
});

const allUsers = TryCatch(async (req, res) => {
  const users = await User.find({});

  /* The outer Promise.all is used to ensure that all asynchronous operations for transforming the users are completed before proceeding. 
  The inner Promise.all is used to perform two asynchronous operations for each user concurrently.
  Both Promise.all usages allow multiple asynchronous operations to run concurrently rather than sequentially. This improves performance by reducing the total waiting time.
  The outer Promise.all runs the mapping operations for all users concurrently.
  The inner Promise.all runs the count operations for each user concurrently. */

  const transformedUsers = await Promise.all(
    users.map(async ({ name, username, avatar, _id }) => {
      const [groups, friends] = await Promise.all([
        Chat.countDocuments({ groupChat: true, members: _id }),
        Chat.countDocuments({ groupChat: false, members: _id }),
      ]);

      return {
        name,
        username,
        avatar: avatar.url,
        _id,
        groups,
        friends,
      };
    })
  );

  return res.status(200).json({
    status: 'success',
    users: transformedUsers,
  });
});

const allChats = TryCatch(async (req, res) => {
  const chats = await Chat.find({})
    .populate('members', 'name avatar')
    .populate('creator', 'name avatar');

  const transformedChat = await Promise.all(
    chats.map(async ({ _id, name, members, groupChat, creator }) => {
      const totalMessages = await Message.countDocuments({ chat: _id });

      return {
        _id,
        groupChat,
        name,
        avatar: members.slice(0, 3).map((member) => member.avatar.url),
        members: members.map(({ _id, name, avatar }) => ({
          _id,
          name,
          avatar: avatar.url,
        })),
        creator: {
          name: creator?.name || 'None',
          avatar: creator?.avatar.url || '',
        },
        totalMembers: members.length,
        totalMessages,
      };
    })
  );

  return res.status(200).json({
    status: 'success',
    chats: transformedChat,
  });
});

const allMessages = TryCatch(async (req, res) => {
  const messages = await Message.find({})
    .populate('sender', 'name avatar')
    .populate('chat', 'groupChat');

  const transformedMessages = messages.map(
    ({ content, attachments, _id, sender, createdAt, chat }) => ({
      _id,
      attachments,
      content,
      createdAt,
      chat: chat._id,
      groupChat: chat.groupChat,
      sender: {
        _id: sender._id,
        name: sender.name,
        avatar: sender.avatar.url,
      },
    })
  );

  return res.status(200).json({
    success: true,
    messages: transformedMessages,
  });
});

const getDashboardStats = TryCatch(async (req, res) => {
  const [groupsCount, usersCount, messagesCount, totalChatsCount] =
    await Promise.all([
      Chat.countDocuments({ groupChat: true }),
      User.countDocuments({}),
      Message.countDocuments({}),
      Chat.countDocuments({}),
    ]);

  const today = new Date();
  const last7Days = new Date();
  last7Days.setDate(today.getDate() - 7);

  const last7DaysMessages = await Message.find({
    createdAt: { $gte: last7Days, $lte: today },
  }).select('createdAt');

  const messages = new Array(7).fill(0);
  const dayInMilisecond = 1000 * 60 * 60 * 24;

  last7DaysMessages.forEach((message) => {
    const indexApprox =
      (today.getTime() - message.createdAt.getTime()) / dayInMilisecond;
    const index = Math.floor(indexApprox);
    messages[6 - index]++;
  });

  const stats = {
    groupsCount,
    usersCount,
    messagesCount,
    totalChatsCount,
    messagesChat: messages,
  };

  return res.status(200).json({
    success: true,
    stats,
  });
});

export {
  allUsers,
  allChats,
  allMessages,
  getDashboardStats,
  adminLogin,
  adminLogout,
  getAdminData,
};
