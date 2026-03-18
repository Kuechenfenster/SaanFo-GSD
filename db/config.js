/**
 * Database Configuration
 * Uses PostgreSQL with Sequelize ORM
 * Compatible with Coolify-hosted databases
 */

const { Sequelize } = require('sequelize');

// Check if database URL is provided (Coolify style)
const databaseUrl = process.env.DATABASE_URL;

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
} else {
  // Use individual connection parameters
  sequelize = new Sequelize(
    process.env.DB_NAME || 'saanfo_map',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: process.env.NODE_ENV === 'development' ? console.log : false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
}

module.exports = sequelize;
