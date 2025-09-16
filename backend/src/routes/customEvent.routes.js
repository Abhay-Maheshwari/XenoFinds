const express = require('express');
const CustomEventController = require('../controllers/customEvent.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

/**
 * @route POST /api/events/webhook
 * @desc Create a webhook event
 * @access Public (secured by webhook secret)
 */
router.post('/webhook', CustomEventController.createWebhookEvent);

// Apply authentication middleware to all other routes
router.use(authenticateToken);

/**
 * @route GET /api/events
 * @desc Get all custom events for the current tenant
 * @access Private
 */
router.get('/', CustomEventController.getAllEvents);

/**
 * @route GET /api/events/stats
 * @desc Get event statistics
 * @access Private
 */
router.get('/stats', CustomEventController.getEventStats);

module.exports = router;
