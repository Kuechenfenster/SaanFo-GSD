/**
 * OTP (One-Time Password) Model
 * Stores verification codes for phone authentication
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const OTP = sequelize.define('OTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    validate: {
      is: /^\+852[0-9]{8}$/
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'otps',
  timestamps: true,
  indexes: [
    { fields: ['phoneNumber'] },
    { fields: ['expiresAt'] }
  ]
});

module.exports = OTP;
