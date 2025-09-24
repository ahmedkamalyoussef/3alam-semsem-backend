import crypto from "crypto";
import Otp from "../modules/OtpModel.js";
import { Op } from "sequelize";
// OTP generation
export function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

// Store OTP
export async function storeOTP(email, otp, type) {
  try {
    await Otp.destroy({ where: { email, type } });
    await Otp.create({
      email,
      otp,
      type,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });
    return true;
  } catch (error) {
    console.error("Error storing OTP:", error);
    return false;
  }
}

// Verify OTP
export async function verifyOTP(email, otp, type) {
  try {
    const otpRecord = await Otp.findOne({
      where: {
        email,
        type,
        isUsed: false,
        expiresAt: { [Op.gt]: new Date() },
      },
    });
    if (!otpRecord) return false;
    if (otpRecord.otp === otp) {
      await otpRecord.update({ isUsed: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return false;
  }
}
