import express from "express";
import {
  createProduct,
  getProducts,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  getWholesaleProducts
} from "./product.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protect(), createProduct);
router.get("/", protect(), getProducts);
router.get("/wholesale", protect(), getWholesaleProducts);
router.get("/category/:categoryId", protect(), getProductsByCategory);
router.patch("/:id", protect(), updateProduct);
router.delete("/:id", protect(), deleteProduct);

export default router;
