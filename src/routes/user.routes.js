import { Router } from 'express';
import {
  acceptFriendRequest,
  getMyFriends,
  getMyNotifications,
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
  sendFriendRequest,
} from '../controllers/user.controller.js';
import {
  multerUpload,
  singleAvatar,
} from '../middlewares/multer.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  acceptRequestValidator,
  loginValidator,
  registerValidator,
  sendRequestValidator,
  validateHandler,
} from '../../lib/validators.js';

const router = Router();

router
  .route('/new')
  .post(singleAvatar, registerValidator(), validateHandler, newUser);
router.route('/login').post(loginValidator(), validateHandler, login);

// After here user must be logged in to access the routes

// Apply isAuthenticated middleware to all routes after this

router.use(isAuthenticated);

router.route('/me').get(getMyProfile);

router.route('/logout').get(logout);

router.route('/search').get(searchUser);

router
  .route('/sendrequest')
  .put(sendRequestValidator(), validateHandler, sendFriendRequest);

router
  .route('/acceptrequest')
  .put(acceptRequestValidator(), validateHandler, acceptFriendRequest);

router.route('/notifications').get(getMyNotifications);

router.route('/friends').get(getMyFriends);

export default router;
