import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "./admin.model.js";
import { generateOTP, storeOTP, verifyOTP } from "../../utils/otpService.js";
import sendOTPEmail  from "../../utils/emailService.js";

// Registration: step 1 (create admin and send OTP)
export const createAdmin = async (req, res) => { 
  try {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password and confirm password do not match" });
    }

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
      if (!existingAdmin.isVerified) {
        const otp = generateOTP();
        await storeOTP(email, otp, "register");
        await sendOTPEmail(email, otp, "register");
        return res.status(200).json({
          message: "Account already exists but not verified. OTP resent to your email.",
          adminId: existingAdmin.id,
        });
      }
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await Admin.create({
      email,
      password_hash: hashedPassword,
      isVerified: false,
    });

    const otp = generateOTP();
    await storeOTP(email, otp, "register");
    await sendOTPEmail(email, otp, "register");

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      adminId: admin.id,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// Registration: step 2 (verify OTP)
export const verifyAdminRegistration = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }
    if (admin.isVerified) {
      return res.status(400).json({ message: "Account already verified" });
    }
    const isValid = await verifyOTP(email, otp, "register");
    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
    admin.isVerified = true;
    await admin.save();
    res.json({ message: "Account verified successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// Login: step 1 (send OTP)
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin not found" });
    }
    if (!admin.isVerified) {
      return res.status(400).json({ status: false, message: "Please verify your account first" });
    }
    const isValidPassword = await bcrypt.compare(password, admin.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ status: false, message: "Invalid credentials" });
    }
    const otp = generateOTP();
    await storeOTP(email, otp, "login");
    await sendOTPEmail(email, otp, "login");
    res.json({ status: true, message: "OTP sent to your email" });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ status: false, message: "Login failed" });
  }
};

// Login: step 2 (verify OTP and get token)
export const verifyAdminLogin = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin not found" });
    }
    const isValid = await verifyOTP(email, otp, "login");
    if (!isValid) {
      return res.status(400).json({ status: false, message: "Invalid or expired OTP" });
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION_TIME || "1d" }
    );
    res.json({
      message: "Login successful",
      token,
      status: true,
      admin: {
        id: admin.id,
        email: admin.email
      },
    });
  } catch (error) {
    console.error("Login verification error:", error);
    res.status(500).json({ status: false, message: "Login verification failed" });
  }
};

export const resendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ status: false, message: "Admin not found" });
    }
    // تحقق من نوع otp (register أو login)
    if (type !== "register" && type !== "login") {
      return res.status(400).json({ status: false, message: "Invalid OTP type" });
    }
    const otp = generateOTP();
    await storeOTP(email, otp, type);
    await sendOTPEmail(email, otp, type);
    res.json({ status: true, message: "OTP resent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ status: false, message: "Failed to resend OTP" });
  }
};