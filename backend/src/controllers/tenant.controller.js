const { Tenant } = require('../models');
const DataIngestionService = require('../services/ingestion.service');
const { prisma } = require('../config/prisma');

class TenantController {
  static async syncData(req, res) {
    try {
      const tenant = req.tenant;
      
      console.log(`🔄 Manual sync requested for tenant: ${tenant.name}`);
      console.log(`📋 Tenant credentials:`, {
        hasApiKey: !!tenant.shopifyApiKey,
        hasApiSecret: !!tenant.shopifyApiSecret,
        hasStoreUrl: !!tenant.shopifyStoreUrl,
        hasAccessToken: !!tenant.accessToken,
        storeUrl: tenant.shopifyStoreUrl
      });
      
      if (!tenant.shopifyApiKey && !tenant.accessToken) {
        return res.status(400).json({ message: 'Shopify API credentials are not configured' });
      }
      
      if (!tenant.shopifyStoreUrl) {
        return res.status(400).json({ message: 'Shopify store URL is not configured' });
      }
      
      console.log(`🚀 Starting manual sync for ${tenant.shopifyStoreUrl}`);
      
      const result = await DataIngestionService.syncAllData(tenant);
      
      console.log(`✅ Manual sync completed:`, result);
      
      return res.status(200).json({
        message: 'Data synchronized successfully',
        result
      });
    } catch (error) {
      console.error('❌ Sync data error:', error);
      return res.status(500).json({ 
        message: 'Failed to synchronize data',
        error: error.message 
      });
    }
  }

  static async getDashboardStats(req, res) {
    try {
      const tenant = req.tenant;
      
      const [totalCustomers, totalOrders, totalProducts, orderTotals] = await Promise.all([
        prisma.customer.count({ where: { tenantId: tenant.id } }),
        prisma.order.count({ where: { tenantId: tenant.id } }),
        prisma.product.count({ where: { tenantId: tenant.id } }),
        prisma.order.aggregate({
          where: { tenantId: tenant.id },
          _sum: { totalPrice: true }
        })
      ]);
      
      const totalRevenue = orderTotals._sum.totalPrice || 0;
      
      return res.status(200).json({
        stats: {
          totalCustomers,
          totalOrders,
          totalProducts,
          totalRevenue: parseFloat(totalRevenue)
        },
        lastSyncedAt: tenant.lastSyncedAt
      });
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return res.status(500).json({ message: 'Failed to get dashboard statistics' });
    }
  }

  /**
   * Update tenant profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateProfile(req, res) {
    try {
      const tenant = req.tenant;
      const { name, email } = req.body;
      
      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      
      // Check if email is already in use by another tenant
      if (email !== tenant.email) {
        const existingTenant = await Tenant.findOne({ where: { email } });
        
        if (existingTenant) {
          return res.status(409).json({ message: 'Email already in use' });
        }
      }
      
      // Update tenant
      await tenant.update({
        name,
        email
      });
      
      return res.status(200).json({
        message: 'Profile updated successfully',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      return res.status(500).json({ message: 'Failed to update profile' });
    }
  }

  /**
   * Change tenant password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async changePassword(req, res) {
    try {
      const tenant = req.tenant;
      const { currentPassword, newPassword } = req.body;
      
      // Validate input
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current password and new password are required' });
      }
      
      // Validate current password
      const isPasswordValid = await tenant.isValidPassword(currentPassword);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      await tenant.update({
        password: newPassword
      });
      
      return res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error) {
      console.error('Change password error:', error);
      return res.status(500).json({ message: 'Failed to change password' });
    }
  }
}

module.exports = TenantController;
