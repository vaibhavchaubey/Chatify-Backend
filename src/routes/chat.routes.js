import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import {
  addMembers,
  deleteChat,
  getChatDetails,
  getMessages,
  getMyChats,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachment,
} from '../controllers/chat.controller.js';
import { attachmentsMulter } from '../middlewares/multer.middleware.js';

const router = Router();

// After here user must be logged in to access the routes

router.use(isAuthenticated);

router.route('/new').post(newGroupChat);
router.route('/my').get(getMyChats);
router.route('/my/groups').get(getMyGroups);
router.route('/addmembers').put(addMembers);
router.route('/removemember').put(removeMember);
router.route('/leave/:id').delete(leaveGroup);
router.route('/message').post(attachmentsMulter, sendAttachment);
router.route('/message/:id').get(getMessages);

router.route('/:id').get(getChatDetails).put(renameGroup).delete(deleteChat);

export default router;
