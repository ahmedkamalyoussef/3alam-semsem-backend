import Admin from "./admin/admin.model.js";
import Category from "./category/category.model.js";
import Expense from "./expense/expense.model.js";
import Product from "./product/product.model.js";
import Repair from "./repair/repair.model.js";
import Sale from "./sale/sale.model.js";
import SaleItem from "./saleItem/saleItem.model.js";

Category.hasMany(Product, { foreignKey: "categoryId", onDelete: "CASCADE" });
Product.belongsTo(Category, { foreignKey: "categoryId" });


Sale.hasMany(SaleItem, { foreignKey: "saleId", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

Product.hasMany(SaleItem, { foreignKey: "productId", onDelete: "CASCADE" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });


export {
  Admin,
  Category,
  Expense,
  Product,
  Repair,
  Sale,
  SaleItem,
};
