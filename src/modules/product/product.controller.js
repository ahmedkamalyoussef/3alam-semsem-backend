import Product from "./product.model.js";
import Category from "../category/category.model.js";
import SaleItem from "../saleItem/saleItem.model.js";
import mongoose from "mongoose";

const validateProductData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Product name is required");
  }
  
  if (!data.price || data.price <= 0) {
    errors.push("Price must be greater than 0");
  }
  
  if (data.stock === undefined || data.stock < 0) {
    errors.push("Stock must be 0 or greater");
  }
  
  if (!data.categoryId) {
    errors.push("Category is required");
  }
  
  return errors;
};

export const createProduct = async (req, res) => {
  try {
    const { name, price, wholesale_price, stock, categoryId } = req.body;

    const validationErrors = validateProductData({ name, price, stock, categoryId });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const existingProduct = await Product.findOne({ 
      name: name.trim(), 
      categoryId 
    });
    if (existingProduct) {
      return res.status(409).json({ 
        message: "Product with this name already exists in this category" 
      });
    }

    const product = await Product.create({ 
      name: name.trim(), 
      price, 
      stock, 
      wholesale_price: wholesale_price,
      categoryId 
    });
    
    res.status(201).json(product);
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .select('-wholesale_price')
      .populate({
        path: 'categoryId',
        select: 'name'
      })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getWholesaleProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate({
        path: 'categoryId',
        select: 'name'
      })
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Valid category ID is required" });
    }

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.find({ categoryId })
      .select('-wholesale_price');

    res.json(products);
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, wholesale_price, categoryId } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
    }

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Product name cannot be empty" });
      }
      
      const existingProduct = await Product.findOne({ 
        name: name.trim(), 
        categoryId: categoryId || product.categoryId,
        _id: { $ne: id }
      });
      if (existingProduct) {
        return res.status(409).json({ 
          message: "Product with this name already exists in this category" 
        });
      }
    }

    if (price !== undefined && price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({ message: "Stock must be 0 or greater" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (wholesale_price !== undefined) updateData.wholesale_price = wholesale_price;

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedProduct);
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Valid product ID is required" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const saleItems = await SaleItem.find({ productId: id });
    if (saleItems.length > 0) {
      return res.status(409).json({ 
        message: "Cannot delete product that has been sold. Please delete related sales first." 
      });
    }

    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};