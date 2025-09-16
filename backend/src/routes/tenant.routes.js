const express = require('express');
const TenantController = require('../controllers/tenant.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

/**
 * @route POST /api/tenants/sync
 * @desc Sync data for the current tenant
 * @access Private
 */
router.post('/sync', TenantController.syncData);

/**
 * @route GET /api/tenants/dashboard-stats
 * @desc Get dashboard statistics for the current tenant
 * @access Private
 */
router.get('/dashboard-stats', TenantController.getDashboardStats);

/**
 * @route PUT /api/tenants/profile
 * @desc Update tenant profile
 * @access Private
 */
router.put('/profile', TenantController.updateProfile);

/**
 * @route PUT /api/tenants/change-password
 * @desc Change tenant password
 * @access Private
 */
router.put('/change-password', TenantController.changePassword);

module.exports = router;
