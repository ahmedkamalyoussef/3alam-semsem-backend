import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const SaleItem = sequelize.define("SaleItem", {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  unitPrice: { type: DataTypes.FLOAT, allowNull: false },
  subTotal: { type: DataTypes.FLOAT, allowNull: false },
}, { timestamps: true });

export default SaleItem;
