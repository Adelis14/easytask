import { Sequelize } from 'sequelize';
import { config } from '../config/env.js';

const sequelize = new Sequelize(
  config.db.database,
  config.db.user,
  config.db.password,
  {
    host: config.db.host,
    port: config.db.port,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: config.db.max,
      min: 0,
      acquire: config.db.connectionTimeoutMillis,
      idle: config.db.idleTimeoutMillis
    },
    dialectOptions: config.db.ssl ? { ssl: { require: true, rejectUnauthorized: false } } : {}
  }
);

export default sequelize;
