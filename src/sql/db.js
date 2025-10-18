import Sequelize from 'sequelize';

const sequelize = new Sequelize('appData', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './src/sql/appData.sqlite',
});

export default sequelize;
