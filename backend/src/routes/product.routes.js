const express = require('express');
const ProductController = require('../controllers/product.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route GET /api/products
 * @desc Get all products for the current tenant
 * @access Private
 */
router.get('/', ProductController.getAllProducts);

/**
 * @route GET /api/products/stats
 * @desc Get product statistics
 * @access Private
 */
router.get('/stats', ProductController.getProductStats);

/**
 * @route GET /api/products/:id
 * @desc Get a product by ID
 * @access Private
 */
router.get('/:id', ProductController.getProductById);

module.exports = router;
