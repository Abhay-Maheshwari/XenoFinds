const express = require('express');
const OrderController = require('../controllers/order.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/orders
 * @desc Get all orders for the current tenant
 * @access Private
 */
router.get('/', OrderController.getAllOrders);

/**
 * @route GET /api/orders/by-date
 * @desc Get orders by date range
 * @access Private
 */
router.get('/by-date', OrderController.getOrdersByDateRange);

/**
 * @route GET /api/orders/stats
 * @desc Get order statistics
 * @access Private
 */
router.get('/stats', OrderController.getOrderStats);

/**
 * @route GET /api/orders/:id
 * @desc Get an order by ID
 * @access Private
 */
router.get('/:id', OrderController.getOrderById);

module.exports = router;
