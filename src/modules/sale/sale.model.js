import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const Sale = sequelize.define("Sale", {
  totalPrice: { type: DataTypes.FLOAT, allowNull: false },
  saleDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: true });

export default Sale;
