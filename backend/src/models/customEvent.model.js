const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CustomEvent = sequelize.define('customEvent', {
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
  eventType: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shopifyId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  customerId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  eventDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  data: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    {
      fields: ['tenantId', 'eventType']
    },
    {
      fields: ['customerId']
    },
    {
      fields: ['eventDate']
    }
  ]
});

module.exports = CustomEvent;
