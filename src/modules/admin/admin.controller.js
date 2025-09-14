import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";

export const createAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne();
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const { email, password } = req.body;
    const password_hash = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ email, password_hash });

    res.status(201).json({ message: "Admin created", admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ where: { email } });
    if (!admin) return res.status(404).json({ message: "Invalid credentials" });

    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
