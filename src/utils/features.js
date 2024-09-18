import jwt from 'jsonwebtoken';
import { getSockets } from '../../lib/helper.js';

const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  sameSite: 'none',
  httpOnly: true,
  secure: true,
};

const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

  return res.status(code).cookie('chatify-token', token, cookieOptions).json({
    success: true,
    user,
    message,
  });
};

const emitEvent = (req, event, users, data) => {
  let io = req.app.get('io');

  const usersSocket = getSockets(users);

  io.to(usersSocket).emit(event, data);
};

export { cookieOptions, sendToken, emitEvent };
