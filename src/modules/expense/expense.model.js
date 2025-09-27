import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  expenseDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Expense = mongoose.model("Expense", expenseSchema);

export default Expense;
