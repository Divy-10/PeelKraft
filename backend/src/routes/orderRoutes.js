import { Router } from 'express';
import {
  createOrder, getMyOrders, getOrderById, cancelOrder,
  getAllOrders, getAdminOrderById, updateOrderStatus,
} from '../controllers/orderController.js';
import userAuth from '../middleware/userAuth.js';
import auth from '../middleware/auth.js';

const router = Router();

// Customer routes
router.post('/', userAuth, createOrder);
router.get('/my-orders', userAuth, getMyOrders);
router.get('/my-orders/:id', userAuth, getOrderById);
router.put('/my-orders/:id/cancel', userAuth, cancelOrder);

// Admin routes
router.get('/admin', auth, getAllOrders);
router.get('/admin/:id', auth, getAdminOrderById);
router.put('/admin/:id', auth, updateOrderStatus);

export default router;
