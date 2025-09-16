const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Order = sequelize.define('order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  shopifyOrderId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  orderDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  subtotalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalTax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalDiscounts: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  totalShipping: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  currency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  financialStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fulfillmentStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  lineItems: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['tenantId', 'shopifyOrderId']
    },
    {
      fields: ['customerId']
    },
    {
      fields: ['orderDate']
    },
    {
      fields: ['totalPrice']
    },
    {
      fields: ['financialStatus']
    },
    {
      fields: ['fulfillmentStatus']
    }
  ]
});

module.exports = Order;
