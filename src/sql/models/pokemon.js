import { STRING, INTEGER } from 'sequelize';
import sequelize from '../db.js';

const Pokemon = sequelize.define('pokemon', {
  name: {
    type: STRING,
    allowNull: false,
  },
  id: {
    primaryKey: true,
    type: STRING,
    unique: true,
  },
  set: {
    type: STRING,
  },
  number: {
    type: STRING,
  },
  rarity: {
    type: STRING,
  },
  hp: {
    type: INTEGER,
    allowNull: true,
  },
  type: {
    type: STRING,
    allowNull: true,
  },
  stage: {
    type: STRING,
    allowNull: true,
  },
  evolvesFrom: {
    type: STRING,
    allowNull: true,
  },
  blurb: {
    type: STRING,
    allowNull: true,
  },
  regulation: {
    type: STRING,
    allowNull: true,
  },
  weakness: {
    type: STRING,
    allowNull: true,
  },
  resistance: {
    type: STRING,
    allowNull: true,
  },
  illustrators: {
    type: STRING,
    allowNull: true,
  },
  pokedex: {
    type: STRING,
    allowNull: true,
  },
  retreat: {
    type: STRING,
    allowNull: true,
  },
}, {
  freezeTableName: true,
});

export default Pokemon;