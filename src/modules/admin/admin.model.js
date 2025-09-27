import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password_hash: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLoginAttempt: {
    type: Date
  }
}, {
  timestamps: true
});

const Admin = mongoose.model("Admin", adminSchema);

export default Admin;
