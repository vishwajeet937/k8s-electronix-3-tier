import { Sequelize } from "sequelize";

let sequelize;

export function getSequelize() {
  if (!sequelize) {
    sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        dialect: "mysql",
        logging: false,

        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000,
        },

        retry: {
          max: 5,
        },
      }
    );
  }

  return sequelize;
}

export default getSequelize;