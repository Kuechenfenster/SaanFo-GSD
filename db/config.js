/**
 * Database Configuration
 * Uses PostgreSQL with Sequelize ORM
 * Compatible with Coolify-hosted databases
 */

const { Sequelize } = require('sequelize');

// Check if database URL is provided (Coolify style)
const databaseUrl = process.env.DATABASE_URL;

// If no DATABASE_URL is provided, fail early with clear message
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('Please add DATABASE_URL in Coolify environment variables.');
  console.error('Example: postgres://postgres:password@host:5432/dbname');
  process.exit(1);
}

let sequelize;

if (databaseUrl) {
  // Use DATABASE_URL from Coolify
  sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = sequelize;
