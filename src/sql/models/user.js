import { STRING, INTEGER } from 'sequelize';
import { define } from '../db';

const User = define('user', {
  id: {
    type: STRING,
    primaryKey: true,
  },
  c4Wins: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  c4Losses: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeMultiWins: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeHighScore: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  yahtzeeTotalScore: {
    type: INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  diceColour: {
    type: STRING,
    defaultValue: 'white',
    allowNull: false,
  },
});

export default User;
