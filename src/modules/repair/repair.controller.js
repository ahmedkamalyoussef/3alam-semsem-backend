import { Op } from "sequelize";
import Repair from "./repair.model.js";

// Create new repair
export const createRepair = async (req, res) => {
  try {
    const repair = await Repair.create(req.body);
    res.status(201).json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all repairs (with optional search by customer_name) - latest first
export const getRepairs = async (req, res) => {
  try {
    const { customer } = req.query;

    const where = {};
    if (customer) {
      where.customerName = { [Op.like]: `%${customer}%` };
    }

    const repairs = await Repair.findAll({
      where,
      order: [["createdAt", "DESC"]],
    });

    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get repair by ID
export const getRepairById = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });

    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update repair info (name, description, cost, etc.)
export const updateRepair = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });

    await repair.update(req.body);

    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark repair as fixed
export const markFixed = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });

    repair.status = "fixed";
    repair.fixed_at = new Date();

    await repair.save();
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark repair as not fixed
export const markNotFixed = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });

    repair.status = "pending"; // رجعها لحالة انتظار أو غير مثبتة
    repair.fixed_at = null;

    await repair.save();
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark repair as delivered
export const markDelivered = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });


    repair.isDelivered = true;
    repair.deliveredAt = new Date();

    await repair.save();
    res.json(repair);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly statistics (count + total cost)
export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const repairs = await Repair.findAll({
      where: {
        status: "fixed",
        isDelivered: true,
        deliveredAt: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });

    const totalCount = repairs.length;
    const totalCost = repairs.reduce((sum, r) => sum + r.cost, 0);

    res.json({
      month,
      year,
      totalCount,
      totalCost,
      repairs,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete repair
export const deleteRepair = async (req, res) => {
  try {
    const repair = await Repair.findByPk(req.params.id);
    if (!repair) return res.status(404).json({ message: "Repair not found" });

    await repair.destroy();
    res.json({ message: "Repair deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
