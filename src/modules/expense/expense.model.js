import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const Expense = sequelize.define("Expense", {
  description: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.FLOAT, allowNull: false },
  expenseDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { timestamps: true });

export default Expense;
