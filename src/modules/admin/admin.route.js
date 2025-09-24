import express from "express";
import { createAdmin, loginAdmin, verifyAdminRegistration, verifyAdminLogin ,resendOTP} from "./admin.controller.js";

const router = express.Router();


// Registration: step 1 (create admin and send OTP)
router.post("/register", createAdmin);
// Registration: step 2 (verify OTP)
router.post("/register/verify", verifyAdminRegistration);

// Login: step 1 (send OTP)
router.post("/login", loginAdmin);
// Login: step 2 (verify OTP and get token)
router.post("/login/verify", verifyAdminLogin);
router.post("/resend-otp", resendOTP);
export default router;
