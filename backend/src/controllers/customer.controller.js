const { prisma } = require('../config/prisma');

/**
 * CustomerController - Handles customer-related operations
 */
class CustomerController {
  /**
   * Get all customers for the current tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllCustomers(req, res) {
    try {
      const tenant = req.tenant;
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {
        tenantId: tenant.id
      };
      
      // Add search condition if provided
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.iLike]: `%${search}%` } },
          { lastName: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Get customers with pagination
      const { count, rows: customers } = await Customer.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        customers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all customers error:', error);
      return res.status(500).json({ message: 'Failed to get customers' });
    }
  }

  /**
   * Get a customer by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCustomerById(req, res) {
    try {
      const tenant = req.tenant;
      const { id } = req.params;
      
      // Find customer
      const customer = await Customer.findOne({
        where: {
          id,
          tenantId: tenant.id
        }
      });
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
      
      // Get customer's orders
      const orders = await Order.findAll({
        where: {
          customerId: customer.id
        },
        order: [['orderDate', 'DESC']],
        limit: 10
      });
      
      return res.status(200).json({
        customer,
        orders
      });
    } catch (error) {
      console.error('Get customer by ID error:', error);
      return res.status(500).json({ message: 'Failed to get customer' });
    }
  }

  /**
   * Get top customers by spending
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getTopCustomers(req, res) {
    try {
      const tenant = req.tenant;
      const { limit = 5 } = req.query;
      
      // Get top customers using Prisma
      const topCustomers = await prisma.customer.findMany({
        where: {
          tenantId: tenant.id
        },
        orderBy: {
          totalSpent: 'desc'
        },
        take: parseInt(limit)
      });
      
      return res.status(200).json({
        topCustomers
      });
    } catch (error) {
      console.error('Get top customers error:', error);
      return res.status(500).json({ message: 'Failed to get top customers' });
    }
  }

  /**
   * Get customer statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getCustomerStats(req, res) {
    try {
      const tenant = req.tenant;
      
      // Get customer statistics
      const [results] = await sequelize.query(`
        SELECT
          COUNT(*) AS "totalCustomers",
          AVG("totalSpent") AS "averageSpent",
          MAX("totalSpent") AS "highestSpent",
          AVG("ordersCount") AS "averageOrders"
        FROM "customers"
        WHERE "tenantId" = '${tenant.id}'
      `);
      
      const stats = results[0] || {
        totalCustomers: 0,
        averageSpent: 0,
        highestSpent: 0,
        averageOrders: 0
      };
      
      // Get new customers in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const newCustomersCount = await Customer.count({
        where: {
          tenantId: tenant.id,
          createdAt: {
            [Op.gte]: thirtyDaysAgo
          }
        }
      });
      
      return res.status(200).json({
        stats: {
          totalCustomers: parseInt(stats.totalCustomers) || 0,
          averageSpent: parseFloat(stats.averageSpent) || 0,
          highestSpent: parseFloat(stats.highestSpent) || 0,
          averageOrders: parseFloat(stats.averageOrders) || 0,
          newCustomers30Days: newCustomersCount
        }
      });
    } catch (error) {
      console.error('Get customer stats error:', error);
      return res.status(500).json({ message: 'Failed to get customer statistics' });
    }
  }
}

module.exports = CustomerController;
