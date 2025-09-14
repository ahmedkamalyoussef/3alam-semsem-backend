import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    define: {
      timestamps: true,
    },
    dialectOptions: {
      connectTimeout: 10000,
    },
  }
);

sequelize
  .authenticate()
  .then(() => console.log("Database connected successfully."))
  .catch((err) => console.error("Database connection error:", err));

export default sequelize;
