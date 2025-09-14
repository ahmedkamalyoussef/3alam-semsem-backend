import Sale from "./sale/sale.model.js";
import SaleItem from "./saleItem/saleItem.model.js";
import Product from "./product/product.model.js";

// Sale and SaleItem associations
Sale.hasMany(SaleItem, { foreignKey: "saleId", onDelete: "CASCADE" });
SaleItem.belongsTo(Sale, { foreignKey: "saleId" });

// Product and SaleItem associations
Product.hasMany(SaleItem, { foreignKey: "productId" });
SaleItem.belongsTo(Product, { foreignKey: "productId" });
