import { Router } from 'express';
import {
  adminLogin,
  adminLogout,
  allChats,
  allMessages,
  allUsers,
  getAdminData,
  getDashboardStats,
} from '../controllers/admin.controller.js';
import { adminLoginValidator, validateHandler } from '../../lib/validators.js';
import { adminOnly } from '../middlewares/auth.middleware.js';

const router = Router();

router
  .route('/verify')
  .post(adminLoginValidator(), validateHandler, adminLogin);

// Only Admin Can Accecss these Routes

router.use(adminOnly);

router.route('/logout').get(adminLogout);

router.route('/').get(getAdminData);
router.route('/users').get(allUsers);

router.route('/chats').get(allChats);

router.route('/messages').get(allMessages);

router.route('/stats').get(getDashboardStats);

export default router;
