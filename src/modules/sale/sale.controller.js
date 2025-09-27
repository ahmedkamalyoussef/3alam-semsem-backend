import Sale from "./sale.model.js";
import SaleItem from "../saleItem/saleItem.model.js";
import Product from "../product/product.model.js";
import mongoose from "mongoose";

const validateSaleData = (items) => {
  const errors = [];
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push("Sale must have at least one item");
    return errors;
  }

  items.forEach((item, index) => {
    if (!item.productId || !mongoose.Types.ObjectId.isValid(item.productId)) {
      errors.push(`Item ${index + 1}: Valid product ID is required`);
    }
    
    if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
      errors.push(`Item ${index + 1}: Quantity must be a positive integer`);
    }
  });

  return errors;
};

export const createSale = async (req, res) => {
  try {
    const { items } = req.body;

    const validationErrors = validateSaleData(items);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    let totalPrice = 0;
    const productsToUpdate = [];

    // Validate all products and check stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          message: `Product with ID ${item.productId} not found` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}` 
        });
      }

      productsToUpdate.push({ product, quantity: item.quantity });
    }

    // Create the sale
    const sale = await Sale.create({ totalPrice: 0 });

    // Create sale items and update stock
    const saleItems = await Promise.all(
      items.map(async (item) => {
        const product = productsToUpdate.find(p => p.product._id.toString() === item.productId).product;
        
        const subTotal = item.quantity * product.price;
        totalPrice += subTotal;

        // Update product stock
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } }
        );

        // Create sale item
        return SaleItem.create({
          saleId: sale._id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subTotal,
        });
      })
    );

    // Update sale with total price
    await Sale.findByIdAndUpdate(sale._id, { totalPrice });

    res.status(201).json({ 
      message: "Sale created successfully",
      sale, 
      items: saleItems 
    });
  } catch (error) {
    console.error("Create sale error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ createdAt: -1 });
    
    // Get sale items for each sale
    const salesWithItems = await Promise.all(
      sales.map(async (sale) => {
        const saleItems = await SaleItem.find({ saleId: sale._id })
          .populate({
            path: 'productId',
            select: 'name price'
          });
        return {
          ...sale.toObject(),
          saleItems
        };
      })
    );
    
    res.json(salesWithItems);
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid sale ID is required" });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const saleItems = await SaleItem.find({ saleId: sale._id })
      .populate('productId', 'name price');

    const saleWithItems = {
      ...sale.toObject(),
      saleItems
    };

    res.json(saleWithItems);
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

    const sales = await Sale.find({
      saleDate: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    // Get sale items for each sale
    const salesWithItems = await Promise.all(
      sales.map(async (sale) => {
        const saleItems = await SaleItem.find({ saleId: sale._id })
          .populate({
            path: 'productId',
            select: 'name price'
          });
        return {
          ...sale.toObject(),
          saleItems
        };
      })
    );

    const totalRevenue = salesWithItems.reduce((sum, s) => sum + s.totalPrice, 0);

    res.json({
      month: monthNum,
      year: yearNum,
      totalRevenue,
      salesCount: salesWithItems.length,
      sales: salesWithItems,
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
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid sale ID is required" });
    }

    const sale = await Sale.findById(id);
    if (!sale) {
      return res.status(404).json({ message: "Sale not found" });
    }

    const saleItems = await SaleItem.find({ saleId: id });
    
    // Restore stock for each product
    for (const saleItem of saleItems) {
      await Product.findByIdAndUpdate(
        saleItem.productId,
        { $inc: { stock: saleItem.quantity } }
      );
    }

    // Delete sale items and sale
    await SaleItem.deleteMany({ saleId: id });
    await Sale.findByIdAndDelete(id);

    res.json({ message: "Sale deleted successfully" });
  } catch (error) {
    console.error("Delete sale error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};