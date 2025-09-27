import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  subTotal: {
    type: Number,
    required: true,
    min: 0
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  saleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Sale",
    required: true
  }
}, {
  timestamps: true
});

const SaleItem = mongoose.model("SaleItem", saleItemSchema);

export default SaleItem;
