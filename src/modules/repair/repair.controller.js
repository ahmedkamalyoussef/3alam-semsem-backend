import { Op } from "sequelize";
import Repair from "./repair.model.js";

const validateRepairData = (data) => {
  const errors = [];
  
  if (!data.customerName || data.customerName.trim().length === 0) {
    errors.push("Customer name is required");
  }
  
  if (!data.deviceName || data.deviceName.trim().length === 0) {
    errors.push("Device name is required");
  }
  
  if (data.cost !== undefined && data.cost < 0) {
    errors.push("Cost cannot be negative");
  }
  
  return errors;
};

export const createRepair = async (req, res) => {
  try {
    const { customerName, deviceName, problemDesc, cost } = req.body;

    const validationErrors = validateRepairData({ customerName, deviceName, problemDesc, cost });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const repair = await Repair.create({ 
      customerName: customerName.trim(), 
      deviceName: deviceName.trim(), 
      problemDesc: problemDesc?.trim() || null, 
      cost: cost || 0,
      status: "pending"
    });
    
    res.status(201).json(repair);
  } catch (error) {
    console.error("Create repair error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

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
    console.error("Get repairs error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getRepairById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    res.json(repair);
  } catch (error) {
    console.error("Get repair by ID error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const updateRepair = async (req, res) => {
  try {
    const { id } = req.params;
  const { customerName, deviceName, problemDesc, cost } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    if (customerName !== undefined) {
      if (!customerName || customerName.trim().length === 0) {
        return res.status(400).json({ message: "Customer name cannot be empty" });
      }
    }

    if (deviceName !== undefined) {
      if (!deviceName || deviceName.trim().length === 0) {
        return res.status(400).json({ message: "Device name cannot be empty" });
      }
    }

    if (cost !== undefined && cost < 0) {
      return res.status(400).json({ message: "Cost cannot be negative" });
    }

  if (customerName !== undefined) repair.customerName = customerName.trim();
  if (deviceName !== undefined) repair.deviceName = deviceName.trim();
  if (problemDesc !== undefined) repair.problemDesc = problemDesc?.trim() || null;
  if (cost !== undefined) repair.cost = cost;

    await repair.save();
    res.json(repair);
  } catch (error) {
    console.error("Update repair error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const markFixed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    repair.status = "fixed";
    repair.fixed_at = new Date();
    repair.isDelivered = false;
    await repair.save();
    res.json(repair);
  } catch (error) {
    console.error("Mark fixed error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const markNotFixed = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    repair.status = "notFixed";
    repair.fixed_at = null;
    repair.isDelivered = false;
    await repair.save();
    res.json(repair);
  } catch (error) {
    console.error("Mark not fixed error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const markDelivered = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    if (repair.status !== "fixed" && repair.status !== "notFixed") {
      return res.status(400).json({ 
        message: "Repair must be marked as fixed or not before it can be delivered" 
      });
    }

    repair.isDelivered = true;
    repair.deliveredAt = new Date();

    await repair.save();
    res.json(repair);
  } catch (error) {
    console.error("Mark delivered error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ 
        message: "Month and Year are required",
        errors: ["Month parameter is required", "Year parameter is required"]
      });
    }

    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ message: "Month must be between 1 and 12" });
    }

    if (yearNum < 2000 || yearNum > 2100) {
      return res.status(400).json({ message: "Year must be between 2000 and 2100" });
    }

    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59);

    // هات كل الريبييرز في الشهر
    const repairs = await Repair.findAll({
      where: {
        createdAt: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });

    const totalCount = repairs.length;

    // احسب التوتال بس من اللي اتصلحت واتسلمت
    const totalCost = repairs
      .filter(r => r.status === "fixed" && r.isDelivered === true)
      .reduce((sum, r) => sum + r.cost, 0);

    res.json({
      month: monthNum,
      year: yearNum,
      totalCount,
      totalCost,
      repairs,
    });
  } catch (error) {
    console.error("Get monthly stats error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};


export const deleteRepair = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid repair ID is required" });
    }

    const repair = await Repair.findByPk(id);
    if (!repair) {
      return res.status(404).json({ message: "Repair not found" });
    }

    await repair.destroy();
    res.json({ message: "Repair deleted successfully" });
  } catch (error) {
    console.error("Delete repair error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
