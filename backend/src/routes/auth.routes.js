const express = require('express');
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new tenant
 * @access Public
 */
router.post('/register', AuthController.register);

/**
 * @route POST /api/auth/login
 * @desc Login a tenant
 * @access Public
 */
router.post('/login', AuthController.login);

/**
 * @route GET /api/auth/profile
 * @desc Get current tenant profile
 * @access Private
 */
router.get('/profile', authenticateToken, AuthController.getProfile);

/**
 * @route PUT /api/auth/shopify-credentials
 * @desc Update Shopify API credentials
 * @access Private
 */
router.put('/shopify-credentials', authenticateToken, AuthController.updateShopifyCredentials);

module.exports = router;
