import mongoose from "mongoose";

const repairSchema = new mongoose.Schema({
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  deviceName: {
    type: String,
    required: true,
    trim: true
  },
  problemDesc: {
    type: String,
    trim: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ["pending", "fixed", "notFixed"],
    default: "pending"
  },
  isDelivered: {
    type: Boolean,
    default: false
  },
  receivedAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
}, {
  timestamps: true
});

const Repair = mongoose.model("Repair", repairSchema);

export default Repair;
