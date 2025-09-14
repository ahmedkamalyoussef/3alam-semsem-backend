import Product from "./product.model.js";
import Category from "../category/category.model.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) return res.status(404).json({ message: "Category not found" });

    const product = await Product.create({ name, price, stock, categoryId });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: Category, attributes: ["id", "name"] }],
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await Category.findByPk(categoryId, {
      include: [{ model: Product }],
    });

    if (!category) return res.status(404).json({ message: "Category not found" });

    res.json(category.Products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, categoryId } = req.body;

    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) return res.status(404).json({ message: "Category not found" });
      product.categoryId = categoryId;
    }

    product.name = name || product.name;
    product.price = price || product.price;
    product.stock = stock ?? product.stock;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    await product.destroy();
    res.json({ message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
