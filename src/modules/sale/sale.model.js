import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  saleDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Sale = mongoose.model("Sale", saleSchema);

export default Sale;
