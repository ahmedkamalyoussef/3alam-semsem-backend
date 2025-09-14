import express from "express";
import {
  createProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
} from "./product.controller.js";

const router = express.Router();

router.post("/", createProduct);
router.get("/", getProducts);
router.get("/category/:categoryId", getProductsByCategory);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
