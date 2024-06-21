import jwt from 'jsonwebtoken';
import { ErrorHandler } from '../utils/utility.js';
import { TryCatch } from './error.middleware.js';
import { User } from '../models/user.model.js';

const isAuthenticated = TryCatch(async (req, res, next) => {
  const token = req.cookies['chatify-token'];

  if (!token) {
    return next(new ErrorHandler('Please login to access this route', 401));
  }

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decodedData?._id);

  if (!user) {
    return next(new ErrorHandler('Invalid Token', 401));
  }

  req.user = decodedData._id;

  next();
});

export { isAuthenticated };
