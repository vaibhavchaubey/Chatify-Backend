import { Router } from 'express';
import {
  getMyProfile,
  login,
  logout,
  newUser,
  searchUser,
} from '../controllers/user.controller.js';
import { multerUpload } from '../middlewares/multer.middleware.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const app = Router();

app.route('/new').post(multerUpload.single('avatar'), newUser);
app.route('/login').post(login);

// After here user must be logged in to access the routes

// Apply isAuthenticated middleware to all routes after this

app.use(isAuthenticated);

app.route('/me').get(getMyProfile);

app.route('/logout').post(logout);

app.route('/search').post(searchUser);

export default app;
