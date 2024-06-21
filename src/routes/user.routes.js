import { Router } from 'express';
import {
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
} from '../controllers/user.controller.js';
import {
  multerUpload,
  singleAvatar,
} from '../middlewares/multer.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  loginValidator,
  registerValidator,
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

router.route('/logout').post(logout);

router.route('/search').post(searchUser);

export default router;
