import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";

const validateAdminData = (data) => {
  const errors = [];
  
  if (!data.email || data.email.trim().length === 0) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }
  
  if (!data.password || data.password.length < 6) {
    errors.push("Password must be at least 6 characters long");
  }
  
  return errors;
};

export const createAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validationErrors = validateAdminData({ email, password });
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: validationErrors 
      });
    }

    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(409).json({ message: "Admin already exists" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ 
      email: email.trim().toLowerCase(), 
      password_hash 
    });

    res.status(201).json({ 
      message: "Admin created successfully", 
      admin: { id: admin.id, email: admin.email } 
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        message: "Email and password are required",
        errors: ["Email is required", "Password is required"]
      });
    }

    const admin = await Admin.findOne({ 
      where: { email: email.trim().toLowerCase() } 
    });
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ 
      message: "Login successful", 
      token,
      admin: { id: admin.id, email: admin.email }
    });
  } catch (error) {
    console.error("Login admin error:", error);
    res.status(500).json({ 
      message: "Internal server error", 
      error: process.env.NODE_ENV === "development" ? error.message : undefined 
    });
  }
};
