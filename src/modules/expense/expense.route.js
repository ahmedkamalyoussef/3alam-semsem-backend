import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyStats,
} from "./expense.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect(), createExpense);
router.get("/", protect(), getExpenses);
router.get("/stats/monthly", protect(), getMonthlyStats);
router.get("/:id", protect(), getExpenseById);
router.patch("/:id", protect(), updateExpense);
router.delete("/:id", protect(), deleteExpense);

export default router;
