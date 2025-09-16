const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const Tenant = sequelize.define('tenant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  shopifyApiKey: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopifyApiSecret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  shopifyStoreUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  accessToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  lastSyncedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (tenant) => {
      if (tenant.password) {
        tenant.password = await bcrypt.hash(tenant.password, 10);
      }
    },
    beforeUpdate: async (tenant) => {
      if (tenant.changed('password')) {
        tenant.password = await bcrypt.hash(tenant.password, 10);
      }
    }
  }
});

// Instance method to check password
Tenant.prototype.isValidPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = Tenant;
