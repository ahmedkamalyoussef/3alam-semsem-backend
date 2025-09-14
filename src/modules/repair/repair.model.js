import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const Repair = sequelize.define("Repair", {
  customerName: { type: DataTypes.STRING, allowNull: false },
  deviceName: { type: DataTypes.STRING, allowNull: false },
  problemDesc: { type: DataTypes.TEXT },
  cost: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.ENUM("pending", "fixed"), defaultValue: "pending" },
  isDelivered: { type: DataTypes.BOOLEAN, defaultValue: false },
  receivedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  deliveredAt: { type: DataTypes.DATE },
}, { timestamps: true });


export default Repair;
