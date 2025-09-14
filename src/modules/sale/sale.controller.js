import Sale from "./sale.model.js";
import SaleItem from "../saleItem/saleItem.model.js";
import Product from "../product/product.model.js";
import { Op } from "sequelize";

const validateSaleData = (items) => {
  const errors = [];
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("Sale must have at least one item");
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.productId || isNaN(item.productId)) {
      errors.push(`Item ${index + 1}: Valid product ID is required`);
    }
    
    if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }
  });

  return errors;
};

export const createSale = async (req, res) => {
  const t = await Sale.sequelize.transaction();

  try {
    const { items } = req.body;

    const validationErrors = validateSaleData(items);
    if (validationErrors.length > 0) {
      await t.rollback();
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    let totalPrice = 0;
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      productsToUpdate.push({ product, quantity: item.quantity });
    }

    const sale = await Sale.create({ totalPrice: 0 }, { transaction: t });

    const saleItems = await Promise.all(
      items.map(async (item) => {
        const product = productsToUpdate.find(p => p.product.id === item.productId).product;
        
        const subTotal = item.quantity * product.price;
        totalPrice += subTotal;

        product.stock -= item.quantity;
        await product.save({ transaction: t });

        return SaleItem.create(
          {
            saleId: sale.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: product.price,
            subTotal,
          },
          { transaction: t }
        );
      })
    );

    sale.totalPrice = totalPrice;
    await sale.save({ transaction: t });

    await t.commit();
    res.status(201).json({ 
      message: "Sale created successfully",
      sale, 
      items: saleItems 
    });
  } catch (error) {
    await t.rollback();
    console.error("Create sale error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};


export const getSales = async (req, res) => {
  try {
    const sales = await Sale.findAll({
      include: [{ model: SaleItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });
    res.json(sales);
  } catch (error) {
    console.error("Get sales error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid sale ID is required" });
    }

    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleItem, include: [Product] }],
    });

    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    res.json(sale);
  } catch (error) {
    console.error("Get sale by ID error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ 
        message: "Month and Year are required",
        errors: ["Month parameter is required", "Year parameter is required"]
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12" });
    }

    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ message: "Year must be between 2000 and 2100" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    const sales = await Sale.findAll({
      where: {
        saleDate: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: SaleItem, include: [Product] }],
      order: [["createdAt", "DESC"]],
    });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalPrice, 0);

    res.json({
      month: monthNum,
      year: yearNum,
      totalRevenue,
      salesCount: sales.length,
      sales,
    });
  } catch (error) {
    console.error("Get monthly stats error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const deleteSale = async (req, res) => {
  const t = await Sale.sequelize.transaction();

  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      await t.rollback();
      return res.status(400).json({ message: "Valid sale ID is required" });
    }

    const sale = await Sale.findByPk(id, {
      include: [{ model: SaleItem, include: [Product] }],
      transaction: t
    });
    
    if (!sale) {
      await t.rollback();
      return res.status(404).json({ message: "Sale not found" });
    }

    for (const saleItem of sale.SaleItems) {
      const product = await Product.findByPk(saleItem.productId, { transaction: t });
      if (product) {
        product.stock += saleItem.quantity;
        await product.save({ transaction: t });
      }
    }

    await SaleItem.destroy({
      where: { saleId: sale.id },
      transaction: t
    });

    await sale.destroy({ transaction: t });

    await t.commit();
    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    await t.rollback();
    console.error("Delete sale error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
