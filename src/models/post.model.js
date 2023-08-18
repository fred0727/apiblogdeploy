const { DataTypes } = require('sequelize');
const { db } = require('../database/config');

const Post = db.define('posts', {
  id: {
    primaryKey: true,
    allowNull: false,
    autoIncrement: true,
    type: DataTypes.INTEGER,
  },
  title: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  status: {
    type: DataTypes.ENUM('active', 'disabled'),
    allowNull: false,
    defaultValue: 'active',
  },
});

// Object.freeze para que no sea mutable
const postStatus = Object.freeze({
  active: 'active',
  disabled: 'disabled',
});

module.exports = { Post, postStatus };
