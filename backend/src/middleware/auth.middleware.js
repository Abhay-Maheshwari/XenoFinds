const jwt = require('jsonwebtoken');
const { prisma } = require('../config/prisma');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication token is required' });
    }
    
    // For demo mode, allow demo tokens
    if (token === 'demo-jwt-token-for-testing') {
      // Get the first tenant for demo
      const tenant = await prisma.tenant.findFirst({
        where: { isActive: true }
      });
      
      if (tenant) {
        req.tenant = tenant;
        return next();
      } else {
        return res.status(404).json({ message: 'No demo tenant found' });
      }
    }
    
    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      }
      
      // Check if tenant exists and is active
      const tenant = await prisma.tenant.findUnique({
        where: { id: decoded.id }
      });
      
      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }
      
      if (!tenant.isActive) {
        return res.status(403).json({ message: 'Tenant account is inactive' });
      }
      
      // Add tenant to request object
      req.tenant = tenant;
      next();
    });
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

module.exports = {
  authenticateToken
};
