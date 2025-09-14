import { Router } from "express";
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  getMonthlyStats,
} from "./expense.controller.js";

const router = Router();

router.post("/", createExpense);
router.get("/", getExpenses);
router.get("/stats/monthly", getMonthlyStats);
router.get("/:id", getExpenseById);
router.patch("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
