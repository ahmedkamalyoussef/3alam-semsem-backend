import express, { json, urlencoded } from "express";
import { config } from "dotenv";
import cors from "cors";
import sequelize from "./lib/database.js";
import "./modules/context.js";
config();

const app = express();
app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("API is running...");
});

import adminRoutes from "./modules/admin/admin.route.js";
import categoryRoutes from "./modules/category/category.route.js";
import expenseRoutes from "./modules/expense/expense.route.js";
import productRoutes from "./modules/product/product.route.js";
import repairRoutes from "./modules/repair/repair.route.js";
import saleRoutes from "./modules/sale/sale.route.js";

app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use("/api/v1/expense", expenseRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/repair", repairRoutes);
app.use("/api/v1/sale", saleRoutes);



// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// Database sync
const PORT = process.env.PORT || 5001;

// sequelize.sync({ alter: true })
//   //.sync({})
//   .then(() => {
//     console.log("Sequelize sync completed");
//     app.listen(PORT, () => {
//       console.log(`Server is running on http://localhost:${PORT}`);
//     });
//   })
//   .catch((err) => {
//     console.error("Sequelize sync failed:", err);
//   });

sequelize
  .authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch((err) => console.error("❌ DB connection failed:", err));

export default app;