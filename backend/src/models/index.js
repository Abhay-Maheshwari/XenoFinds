const { sequelize } = require('../config/database');
const Tenant = require('./tenant.model');
const Customer = require('./customer.model');
const Order = require('./order.model');
const Product = require('./product.model');
const CustomEvent = require('./customEvent.model');

// Define associations
Tenant.hasMany(Customer, { foreignKey: 'tenantId', as: 'customers' });
Customer.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Order, { foreignKey: 'tenantId', as: 'orders' });
Order.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(Product, { foreignKey: 'tenantId', as: 'products' });
Product.belongsTo(Tenant, { foreignKey: 'tenantId' });

Tenant.hasMany(CustomEvent, { foreignKey: 'tenantId', as: 'customEvents' });
CustomEvent.belongsTo(Tenant, { foreignKey: 'tenantId' });

Customer.hasMany(Order, { foreignKey: 'customerId', as: 'orders' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

Customer.hasMany(CustomEvent, { foreignKey: 'customerId', as: 'customEvents' });
CustomEvent.belongsTo(Customer, { foreignKey: 'customerId' });

// Function to sync all models with the database
const syncModels = async () => {
  try {
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('All models were synchronized successfully.');
  } catch (error) {
    console.error('Failed to synchronize models:', error);
  }
};

module.exports = {
  sequelize,
  Tenant,
  Customer,
  Order,
  Product,
  CustomEvent,
  syncModels
};
