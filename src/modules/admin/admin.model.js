import { DataTypes } from "sequelize";
import sequelize from "../../lib/database.js";

const Admin = sequelize.define("Admin", {
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password_hash: { type: DataTypes.STRING, allowNull: false }
}, { timestamps: true });

export default Admin;
