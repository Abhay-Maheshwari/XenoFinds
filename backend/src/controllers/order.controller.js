const { prisma } = require('../config/prisma');

/**
 * OrderController - Handles order-related operations
 */
class OrderController {
  /**
   * Get all orders for the current tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllOrders(req, res) {
    try {
      const tenant = req.tenant;
      const { 
        page = 1, 
        limit = 10, 
        search, 
        sortBy = 'orderDate', 
        sortOrder = 'DESC',
        startDate,
        endDate,
        status
      } = req.query;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {
        tenantId: tenant.id
      };
      
      // Add search condition if provided
      if (search) {
        whereClause[Op.or] = [
          { orderNumber: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Add date range if provided
      if (startDate && endDate) {
        whereClause.orderDate = {
          [Op.between]: [new Date(startDate), new Date(endDate)]
        };
      } else if (startDate) {
        whereClause.orderDate = {
          [Op.gte]: new Date(startDate)
        };
      } else if (endDate) {
        whereClause.orderDate = {
          [Op.lte]: new Date(endDate)
        };
      }
      
      // Add status filter if provided
      if (status) {
        whereClause.financialStatus = status;
      }
      
      // Get orders with pagination
      const { count, rows: orders } = await Order.findAndCountAll({
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
        orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all orders error:', error);
      return res.status(500).json({ message: 'Failed to get orders' });
    }
  }

  /**
   * Get an order by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrderById(req, res) {
    try {
      const tenant = req.tenant;
      const { id } = req.params;
      
      // Find order
      const order = await Order.findOne({
        where: {
          id,
          tenantId: tenant.id
        },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          }
        ]
      });
      
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
      
      return res.status(200).json({
        order
      });
    } catch (error) {
      console.error('Get order by ID error:', error);
      return res.status(500).json({ message: 'Failed to get order' });
    }
  }

  /**
   * Get orders by date range
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrdersByDateRange(req, res) {
    try {
      const tenant = req.tenant;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Start date and end date are required' });
      }
      
      // Get orders by date range using Prisma
      const orders = await prisma.order.findMany({
        where: {
          tenantId: tenant.id,
          processedAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        orderBy: {
          processedAt: 'asc'
        }
      });
      
      // Group orders by date
      const ordersByDate = {};
      
      orders.forEach(order => {
        const date = order.processedAt ? order.processedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        
        if (!ordersByDate[date]) {
          ordersByDate[date] = {
            date,
            count: 0,
            totalRevenue: 0
          };
        }
        
        ordersByDate[date].count++;
        ordersByDate[date].totalRevenue += parseFloat(order.totalPrice);
      });
      
      return res.status(200).json({
        ordersByDate: Object.values(ordersByDate)
      });
    } catch (error) {
      console.error('Get orders by date range error:', error);
      return res.status(500).json({ message: 'Failed to get orders by date range' });
    }
  }

  /**
   * Get order statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getOrderStats(req, res) {
    try {
      const tenant = req.tenant;
      
      // Get order statistics
      const [results] = await sequelize.query(`
        SELECT
          COUNT(*) AS "totalOrders",
          SUM("totalPrice") AS "totalRevenue",
          AVG("totalPrice") AS "averageOrderValue",
          COUNT(DISTINCT "customerId") AS "uniqueCustomers"
        FROM "orders"
        WHERE "tenantId" = '${tenant.id}'
      `);
      
      const stats = results[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        uniqueCustomers: 0
      };
      
      // Get orders in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrdersCount = await Order.count({
        where: {
          tenantId: tenant.id,
          orderDate: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      
      const recentRevenue = await Order.sum('totalPrice', {
        where: {
          tenantId: tenant.id,
          orderDate: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      
      return res.status(200).json({
        stats: {
          totalOrders: parseInt(stats.totalOrders) || 0,
          totalRevenue: parseFloat(stats.totalRevenue) || 0,
          averageOrderValue: parseFloat(stats.averageOrderValue) || 0,
          uniqueCustomers: parseInt(stats.uniqueCustomers) || 0,
          recentOrders30Days: recentOrdersCount || 0,
          recentRevenue30Days: parseFloat(recentRevenue) || 0
        }
      });
    } catch (error) {
      console.error('Get order stats error:', error);
      return res.status(500).json({ message: 'Failed to get order statistics' });
    }
  }
}

module.exports = OrderController;
