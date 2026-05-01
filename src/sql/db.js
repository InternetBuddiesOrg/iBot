import { Sequelize } from 'sequelize';

// Connects models to the appData.sqlite file
const sequelize = new Sequelize('appData', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './src/sql/appData.sqlite',
});


export default sequelize;
