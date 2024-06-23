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
  sendAttachments,
} from '../controllers/chat.controller.js';
import { attachmentsMulter } from '../middlewares/multer.middleware.js';
import {
  addMemberValidator,
  chatIdValidator,
  newGroupValidator,
  removeMemberValidator,
  renameValidator,
  sendAttachmentsValidator,
  validateHandler,
} from '../../lib/validators.js';

const router = Router();

// After here user must be logged in to access the routes

router.use(isAuthenticated);

router.route('/new').post(newGroupValidator(), validateHandler, newGroupChat);
router.route('/my').get(getMyChats);
router.route('/my/groups').get(getMyGroups);
router
  .route('/addmembers')
  .put(addMemberValidator(), validateHandler, addMembers);
router
  .route('/removemember')
  .put(removeMemberValidator(), validateHandler, removeMember);
router
  .route('/leave/:id')
  .delete(chatIdValidator(), validateHandler, leaveGroup);
router
  .route('/message')
  .post(
    attachmentsMulter,
    sendAttachmentsValidator(),
    validateHandler,
    sendAttachments
  );
router
  .route('/message/:id')
  .get(chatIdValidator(), validateHandler, getMessages);

router
  .route('/:id')
  .get(chatIdValidator(), validateHandler, getChatDetails)
  .put(renameValidator(), validateHandler, renameGroup)
  .delete(chatIdValidator(), validateHandler, deleteChat);

export default router;
