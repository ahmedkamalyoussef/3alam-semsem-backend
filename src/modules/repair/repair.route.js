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

const router = Router();

router.post("/", createRepair);
router.get("/", getRepairs);
router.get("/:id", getRepairById);
router.patch("/:id", updateRepair);
router.patch("/:id/fixed", markFixed);
router.patch("/:id/not-fixed", markNotFixed);
router.patch("/:id/deliver", markDelivered);
router.get("/stats/monthly", getMonthlyStats);
router.delete("/:id", deleteRepair);

export default router;
