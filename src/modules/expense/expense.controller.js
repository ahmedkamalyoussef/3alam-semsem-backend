import Expense from "./expense.model.js";
import { Op } from "sequelize";

export const createExpense = async (req, res) => {
  try {
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      order: [["createdAt", "DESC"]],
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.update(req.body);
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    await expense.destroy();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMonthlyStats = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and Year are required" });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const expenses = await Expense.findAll({
      where: {
        expenseDate: { [Op.between]: [startDate, endDate] },
      },
      order: [["createdAt", "DESC"]],
    });

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      month,
      year,
      totalAmount,
      expenses,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
