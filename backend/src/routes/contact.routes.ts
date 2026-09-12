import { Router } from 'express';
import { sendContactMessage } from '../controllers/contact.controllers.js';

const contactRouter = Router();

contactRouter.post('/contacts', sendContactMessage);

export default contactRouter;