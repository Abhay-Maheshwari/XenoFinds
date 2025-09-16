const { CustomEvent, Customer, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * CustomEventController - Handles custom event-related operations
 */
class CustomEventController {
  /**
   * Get all custom events for the current tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllEvents(req, res) {
    try {
      const tenant = req.tenant;
      const { 
        page = 1, 
        limit = 10, 
        eventType, 
        sortBy = 'eventDate', 
        sortOrder = 'DESC',
        startDate,
        endDate
      } = req.query;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {
        tenantId: tenant.id
      };
      
      // Add event type filter if provided
      if (eventType) {
        whereClause.eventType = eventType;
      }
      
      // Add date range if provided
      if (startDate && endDate) {
        whereClause.eventDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.eventDate = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.eventDate = {
          [Op.lte]: new Date(endDate)
        };
      }
      
      // Get events with pagination
      const { count, rows: events } = await CustomEvent.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }
        ],
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        events,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all events error:', error);
      return res.status(500).json({ message: 'Failed to get events' });
    }
  }

  /**
   * Get event statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getEventStats(req, res) {
    try {
      const tenant = req.tenant;
      
      // Get event counts by type
      const eventCounts = await CustomEvent.findAll({
        attributes: [
          'eventType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          tenantId: tenant.id
        },
        group: ['eventType'],
        order: [[sequelize.literal('count'), 'DESC']]
      });
      
      // Get events in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentEventCounts = await CustomEvent.findAll({
        attributes: [
          'eventType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          tenantId: tenant.id,
          eventDate: {
            [Op.gte]: thirtyDaysAgo
          }
        },
        group: ['eventType'],
        order: [[sequelize.literal('count'), 'DESC']]
      });
      
      // Get cart abandonment rate
      const [abandonmentResults] = await sequelize.query(`
        SELECT
          (SELECT COUNT(*) FROM "customEvents" 
           WHERE "tenantId" = '${tenant.id}' AND "eventType" = 'cart_abandoned') AS "abandonedCarts",
          (SELECT COUNT(*) FROM "orders" 
           WHERE "tenantId" = '${tenant.id}') AS "completedOrders"
      `);
      
      const abandonmentStats = abandonmentResults[0] || {
        abandonedCarts: 0,
        completedOrders: 0
      };
      
      const totalCarts = parseInt(abandonmentStats.abandonedCarts) + parseInt(abandonmentStats.completedOrders);
      const abandonmentRate = totalCarts > 0 ? (parseInt(abandonmentStats.abandonedCarts) / totalCarts) * 100 : 0;
      
      return res.status(200).json({
        eventCounts,
        recentEventCounts,
        abandonmentStats: {
          abandonedCarts: parseInt(abandonmentStats.abandonedCarts),
          completedOrders: parseInt(abandonmentStats.completedOrders),
          abandonmentRate: parseFloat(abandonmentRate.toFixed(2))
        }
      });
    } catch (error) {
      console.error('Get event stats error:', error);
      return res.status(500).json({ message: 'Failed to get event statistics' });
    }
  }

  /**
   * Create a webhook event
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async createWebhookEvent(req, res) {
    try {
      const { tenantId, eventType, shopifyId, data } = req.body;
      
      // Validate input
      if (!tenantId || !eventType || !data) {
        return res.status(400).json({ message: 'Tenant ID, event type, and data are required' });
      }
      
      // Find tenant
      const tenant = await Tenant.findByPk(tenantId);
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      // Find customer if customer data is provided
      let customerId = null;
      
      if (data.customer && data.customer.id) {
        const customer = await Customer.findOne({
          where: {
            tenantId: tenant.id,
            shopifyCustomerId: data.customer.id.toString()
          }
        });
        
        if (customer) {
          customerId = customer.id;
        }
      }
      
      // Create event
      const event = await CustomEvent.create({
        tenantId: tenant.id,
        eventType,
        shopifyId: shopifyId ? shopifyId.toString() : null,
        customerId,
        eventDate: new Date(),
        data
      });
      
      return res.status(201).json({
        message: 'Event created successfully',
        event
      });
    } catch (error) {
      console.error('Create webhook event error:', error);
      return res.status(500).json({ message: 'Failed to create event' });
    }
  }
}

module.exports = CustomEventController;
