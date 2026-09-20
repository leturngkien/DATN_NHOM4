import { Router } from 'express';
import {
  getAllService,
  getServicesActive,
  getServiceById,
  insertService,
  updateService,
  toggleService,
  deleteService
} from '../controllers/service.controllers.js';
import { requireAdmin } from '../middlewares/protectRoute.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const serviceRouter = Router();

// http://localhost:5000/api/v1/services

serviceRouter.get('/services', getAllService);
serviceRouter.get('/services/status/active', getServicesActive);
serviceRouter.get('/services/:id', getServiceById);
serviceRouter.post('/services', verifyToken, requireAdmin, insertService);
serviceRouter.patch('/services/:id', verifyToken, requireAdmin, updateService);
serviceRouter.patch('/services/status/:id', verifyToken, requireAdmin, toggleService);
serviceRouter.delete('/services/:id', verifyToken, requireAdmin, deleteService);

export default serviceRouter;
