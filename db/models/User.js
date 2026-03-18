/**
 * User Model
 * Stores user account information
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    validate: {
      is: /^\+852[0-9]{8}$/
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  homeLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  homeLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  workLatitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -90,
      max: 90
    }
  },
  workLongitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
    validate: {
      min: -180,
      max: 180
    }
  },
  sessionToken: {
    type: DataTypes.STRING(100),
    allowNull: true,
    unique: true
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    comment: 'Product categories user is interested in'
  }
}, {
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['phoneNumber'] },
    { fields: ['sessionToken'] }
  ]
});

module.exports = User;
