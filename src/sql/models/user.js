const Sequelize = require('sequelize');
const sequelize = require('../db');

const User = sequelize.define('user', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
  },
  c4Wins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  c4Losses: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeMultiWins: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeHighScore: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeTotalScore: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  diceColour: {
    type: Sequelize.STRING,
    defaultValue: 'white',
    allowNull: false,
  },
});

module.exports = User;
