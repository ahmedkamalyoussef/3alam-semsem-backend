import Category from "./category.model.js";
import Product from "../product/product.model.js";

const validateCategoryData = (data) => {
  const errors = [];
  
  if (!data.name || data.name.trim().length === 0) {
    errors.push("Category name is required");
  }
  
  if (data.name && data.name.trim().length < 2) {
    errors.push("Category name must be at least 2 characters long");
  }
  
  return errors;
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const validationErrors = validateCategoryData({ name, description });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const existingCategory = await Category.findOne({ 
      where: { name: name.trim() } 
    });
    if (existingCategory) {
      return res.status(409).json({ 
        message: "Category with this name already exists" 
      });
    }

    const category = await Category.create({ 
      name: name.trim(), 
      description: description?.trim() || null 
    });
    
    res.status(201).json(category);
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid category ID is required" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return res.status(400).json({ message: "Category name cannot be empty" });
      }
      
      if (name.trim().length < 2) {
        return res.status(400).json({ message: "Category name must be at least 2 characters long" });
      }

      const existingCategory = await Category.findOne({ 
        where: { 
          name: name.trim(),
          id: { [require('sequelize').Op.ne]: id }
        } 
      });
      if (existingCategory) {
        return res.status(409).json({ 
          message: "Category with this name already exists" 
        });
      }
    }

    if (name !== undefined) category.name = name.trim();
    if (description !== undefined) category.description = description?.trim() || null;

    await category.save();
    res.json(category);
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid category ID is required" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const products = await Product.findAll({ where: { categoryId: id } });
    if (products.length > 0) {
      return res.status(409).json({ 
        message: `Cannot delete category that has ${products.length} product(s). Please delete or move the products first.` 
      });
    }

    await category.destroy();
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
