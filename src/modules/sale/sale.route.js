import { Router } from "express";
import {
  createSale,
  getSales,
  getSaleById,
  getMonthlyStats,
  deleteSale,
} from "./sale.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect(), createSale);
router.get("/", protect(), getSales);
router.get("/stats/monthly", protect(), getMonthlyStats);
router.get("/:id", protect(), getSaleById);
router.delete("/:id", protect(), deleteSale);

export default router;
