import Admin from "./admin/admin.model.js";
import Category from "./category/category.model.js";
import Expense from "./expense/expense.model.js";
import Product from "./product/product.model.js";
import Repair from "./repair/repair.model.js";
import Sale from "./sale/sale.model.js";
import SaleItem from "./saleItem/saleItem.model.js";

// MongoDB doesn't need explicit associations like Sequelize
// Relationships are handled through ObjectId references in the schemas

export {
  Admin,
  Category,
  Expense,
  Product,
  Repair,
  Sale,
  SaleItem,
};
