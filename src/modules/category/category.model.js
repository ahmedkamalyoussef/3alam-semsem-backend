import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const Category = sequelize.define("Category", {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.STRING },
}, { timestamps: true });

export default Category;
