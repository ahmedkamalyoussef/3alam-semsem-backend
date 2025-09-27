import { Router } from "express";
import {
  createRepair,
  getRepairs,
  getRepairById,
  updateRepair,
  markFixed,
  markNotFixed,
  markDelivered,
  getMonthlyStats,
  deleteRepair,
} from "./repair.controller.js";
import protect from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/", protect, createRepair);
router.get("/", protect, getRepairs);
router.get("/:id", protect, getRepairById);
router.patch("/:id", protect, updateRepair);
router.patch("/:id/fixed", protect, markFixed);
router.patch("/:id/not-fixed", protect, markNotFixed);
router.patch("/:id/deliver", protect, markDelivered);
router.get("/stats/monthly", protect, getMonthlyStats);
router.delete("/:id", protect, deleteRepair);

export default router;
