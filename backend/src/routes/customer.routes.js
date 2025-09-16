const express = require('express');
const CustomerController = require('../controllers/customer.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/customers
 * @desc Get all customers for the current tenant
 * @access Private
 */
router.get('/', CustomerController.getAllCustomers);

/**
 * @route GET /api/customers/top
 * @desc Get top customers by spending
 * @access Private
 */
router.get('/top', CustomerController.getTopCustomers);

/**
 * @route GET /api/customers/stats
 * @desc Get customer statistics
 * @access Private
 */
router.get('/stats', CustomerController.getCustomerStats);

/**
 * @route GET /api/customers/:id
 * @desc Get a customer by ID
 * @access Private
 */
router.get('/:id', CustomerController.getCustomerById);

module.exports = router;
