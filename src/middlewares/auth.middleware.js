import jwt from "jsonwebtoken";
import Admin from "../modules/admin/admin.model.js";

const protect = async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          status: false,
          message: "Access denied. No token provided or invalid format.",
        });
      }
      const token = authHeader.substring(7);
      if (!token) {
        return res.status(401).json({
          status: false,
          message: "Access denied. No token provided.",
        });
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Find user
      const user = await Admin.findById(decoded.id);
      if (!user) {
        return res.status(401).json({
          status: false,
          message: "Access denied. Invalid token.",
        });
      }
      req.user = user;
      req.admin = user;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          status: false,
          message: "Access denied. Invalid token.",
        error: error.message,
        });
      }
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          status: false,
          message: "Access denied. Token expired.",
        error: error.message,
        });
      }
      return res.status(500).json({
        status: false,
        message: "Authentication failed.",
        error: error.message,
      });
    }
};

export default protect;