import express from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "./category.controller.js";
import protect from "../../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/", protect, createCategory);
router.get("/", protect, getCategories);
router.patch("/:id", protect, updateCategory);
router.delete("/:id", protect, deleteCategory);

export default router;
