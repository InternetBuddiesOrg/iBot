const Sequelize = require('sequelize');

const sequelize = new Sequelize('appData', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './src/sql/appData.sqlite',
});

module.exports = sequelize;
