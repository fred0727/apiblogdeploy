const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Error = db.define('errors', {
  id: {
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  stack: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
});

module.exports = Error;
