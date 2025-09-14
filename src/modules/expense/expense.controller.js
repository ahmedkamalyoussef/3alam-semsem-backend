import Expense from "./expense.model.js";
import { Op } from "sequelize";

const validateExpenseData = (data) => {
  const errors = [];
  
  if (!data.description || data.description.trim().length === 0) {
    errors.push("Expense description is required");
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }
  
  if (data.expenseDate && isNaN(new Date(data.expenseDate).getTime())) {
    errors.push("Invalid expense date format");
  }
  
  return errors;
};

export const createExpense = async (req, res) => {
  try {
    const { description, amount, expenseDate } = req.body;

    const validationErrors = validateExpenseData({ description, amount, expenseDate });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const expense = await Expense.create({ 
      description: description.trim(), 
      amount, 
      expenseDate: expenseDate || new Date() 
    });
    
    res.status(201).json(expense);
  } catch (error) {
    console.error("Create expense error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(expenses);
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid expense ID is required" });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    
    res.json(expense);
  } catch (error) {
    console.error("Get expense by ID error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, expenseDate } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid expense ID is required" });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    if (description !== undefined) {
      if (!description || description.trim().length === 0) {
        return res.status(400).json({ message: "Expense description cannot be empty" });
      }
    }

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than 0" });
    }

    if (expenseDate !== undefined && isNaN(new Date(expenseDate).getTime())) {
      return res.status(400).json({ message: "Invalid expense date format" });
    }

    if (description !== undefined) expense.description = description.trim();
    if (amount !== undefined) expense.amount = amount;
    if (expenseDate !== undefined) expense.expenseDate = expenseDate;

    await expense.save();
    res.json(expense);
  } catch (error) {
    console.error("Update expense error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Valid expense ID is required" });
    }

    const expense = await Expense.findByPk(id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.destroy();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
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

    const expenses = await Expense.findAll({
      where: {
        expenseDate: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      month: monthNum,
      year: yearNum,
      totalAmount,
      expensesCount: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get monthly stats error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
