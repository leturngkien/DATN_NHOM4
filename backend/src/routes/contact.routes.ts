import { Router } from 'express';
import {
  sendContactMessage,
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact
} from '../controllers/contact.controllers.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { requireAdmin } from '../middlewares/protectRoute.js';

const contactRouter = Router();

contactRouter.post('/contacts', sendContactMessage);
contactRouter.get('/contacts', verifyToken, requireAdmin, getAllContacts);
contactRouter.get('/contacts/:id', verifyToken, requireAdmin, getContactById);
contactRouter.patch('/contacts/:id/status', verifyToken, requireAdmin, updateContactStatus);
contactRouter.delete('/contacts/:id', verifyToken, requireAdmin, deleteContact);

export default contactRouter;