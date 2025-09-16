const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('../config/prisma');
require('dotenv').config();

/**
 * AuthController - Handles authentication operations
 */
class AuthController {
  /**
   * Register a new tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async register(req, res) {
    try {
      const { name, email, password } = req.body;
      
      // Validate input
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
      }
      
      // Check if tenant already exists
      const existingTenant = await prisma.tenant.findUnique({ 
        where: { email } 
      });
      
      if (existingTenant) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Create new tenant
      const tenant = await prisma.tenant.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });
      
      // Generate JWT token
      const token = jwt.sign(
        { id: tenant.id, email: tenant.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      return res.status(201).json({
        message: 'Tenant registered successfully',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email
        },
        token
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ message: 'Failed to register tenant' });
    }
  }

  /**
   * Login a tenant
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Validate input
      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
      }
      
      // Find tenant by email
      const tenant = await prisma.tenant.findUnique({ 
        where: { email } 
      });
      
      if (!tenant) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Check if tenant is active
      if (!tenant.isActive) {
        return res.status(403).json({ message: 'Account is inactive' });
      }
      
      // Validate password
      const isPasswordValid = await bcrypt.compare(password, tenant.password);
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: tenant.id, email: tenant.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );
      
      return res.status(200).json({
        message: 'Login successful',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ message: 'Failed to login' });
    }
  }

  /**
   * Get current tenant profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async getProfile(req, res) {
    try {
      const tenant = req.tenant;
      
      return res.status(200).json({
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          shopifyStoreUrl: tenant.shopifyStoreUrl,
          lastSyncedAt: tenant.lastSyncedAt
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json({ message: 'Failed to get profile' });
    }
  }

  /**
   * Update Shopify API credentials
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static async updateShopifyCredentials(req, res) {
    try {
      const tenant = req.tenant;
      const { shopifyApiKey, shopifyApiSecret, shopifyStoreUrl } = req.body;
      
      // Validate input
      if (!shopifyApiKey || !shopifyApiSecret || !shopifyStoreUrl) {
        return res.status(400).json({ message: 'All Shopify API credentials are required' });
      }
      
      // Update tenant
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenant.id },
        data: {
          shopifyApiKey,
          shopifyApiSecret,
          shopifyStoreUrl
        }
      });
      
      return res.status(200).json({
        message: 'Shopify API credentials updated successfully',
        tenant: {
          id: tenant.id,
          name: tenant.name,
          email: tenant.email,
          shopifyStoreUrl: tenant.shopifyStoreUrl
        }
      });
    } catch (error) {
      console.error('Update Shopify credentials error:', error);
      return res.status(500).json({ message: 'Failed to update Shopify credentials' });
    }
  }
}

module.exports = AuthController;
