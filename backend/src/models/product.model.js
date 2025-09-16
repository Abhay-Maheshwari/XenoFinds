const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Product = sequelize.define('product', {
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
  shopifyProductId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  vendor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  productType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  handle: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: true
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  variants: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  options: {
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
      fields: ['tenantId', 'shopifyProductId']
    },
    {
      fields: ['title']
    },
    {
      fields: ['vendor']
    },
    {
      fields: ['productType']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Product;
