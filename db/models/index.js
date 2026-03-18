/**
 * Database Models Index
 * Exports all Sequelize models
 */

const sequelize = require('../config');
const User = require('./User');
const OTP = require('./OTP');

// Define associations
OTP.belongsTo(User, { foreignKey: 'phoneNumber', targetKey: 'phoneNumber' });
User.hasMany(OTP, { foreignKey: 'phoneNumber', sourceKey: 'phoneNumber' });

module.exports = {
  sequelize,
  User,
  OTP
};
