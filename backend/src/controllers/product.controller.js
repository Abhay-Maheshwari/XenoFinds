const { Product, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * ProductController - Handles product-related operations
 */
class ProductController {
  /**
   * Get all products for the current tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getAllProducts(req, res) {
    try {
      const tenant = req.tenant;
      const { page = 1, limit = 10, search, sortBy = 'title', sortOrder = 'ASC' } = req.query;
      
      // Calculate offset
      const offset = (page - 1) * limit;
      
      // Build where clause
      const whereClause = {
        tenantId: tenant.id
      };
      
      // Add search condition if provided
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { vendor: { [Op.iLike]: `%${search}%` } },
          { productType: { [Op.iLike]: `%${search}%` } }
        ];
      }
      
      // Get products with pagination
      const { count, rows: products } = await Product.findAndCountAll({
        where: whereClause,
        order: [[sortBy, sortOrder]],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
      
      return res.status(200).json({
        products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(count / limit)
        }
      });
    } catch (error) {
      console.error('Get all products error:', error);
      return res.status(500).json({ message: 'Failed to get products' });
    }
  }

  /**
   * Get a product by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProductById(req, res) {
    try {
      const tenant = req.tenant;
      const { id } = req.params;
      
      // Find product
      const product = await Product.findOne({
        where: {
          id,
          tenantId: tenant.id
        }
      });
      
      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
      
      return res.status(200).json({
        product
      });
    } catch (error) {
      console.error('Get product by ID error:', error);
      return res.status(500).json({ message: 'Failed to get product' });
    }
  }

  /**
   * Get product statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProductStats(req, res) {
    try {
      const tenant = req.tenant;
      
      // Get product statistics
      const [results] = await sequelize.query(`
        SELECT
          COUNT(*) AS "totalProducts",
          COUNT(DISTINCT "productType") AS "productCategories",
          COUNT(DISTINCT "vendor") AS "vendors"
        FROM "products"
        WHERE "tenantId" = '${tenant.id}'
      `);
      
      const stats = results[0] || {
        totalProducts: 0,
        productCategories: 0,
        vendors: 0
      };
      
      // Get products by category
      const productsByCategory = await Product.findAll({
        attributes: [
          'productType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          tenantId: tenant.id,
          productType: {
            [Op.ne]: null
          }
        },
        group: ['productType'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 5
      });
      
      // Get products by vendor
      const productsByVendor = await Product.findAll({
        attributes: [
          'vendor',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          tenantId: tenant.id,
          vendor: {
            [Op.ne]: null
          }
        },
        group: ['vendor'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 5
      });
      
      return res.status(200).json({
        stats: {
          totalProducts: parseInt(stats.totalProducts) || 0,
          productCategories: parseInt(stats.productCategories) || 0,
          vendors: parseInt(stats.vendors) || 0
        },
        productsByCategory,
        productsByVendor
      });
    } catch (error) {
      console.error('Get product stats error:', error);
      return res.status(500).json({ message: 'Failed to get product statistics' });
    }
  }
}

module.exports = ProductController;
