import { Router } from "express";
import {
  createSale,
  getSales,
  getSaleById,
  getMonthlyStats,
  deleteSale,
} from "./sale.controller.js";

const router = Router();

router.post("/", createSale);
router.get("/", getSales);
router.get("/stats/monthly", getMonthlyStats);
router.get("/:id", getSaleById);
router.delete("/:id", deleteSale);

export default router;
