import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";
import Category from "../category/category.model.js";

const Product = sequelize.define("Product", {
  name: { type: DataTypes.STRING, allowNull: false },
  wholesale_price: { type: DataTypes.FLOAT, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { timestamps: true });

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });
export default Product;
