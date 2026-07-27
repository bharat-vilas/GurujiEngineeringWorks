import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authenticateToken } from "../middleware/authMiddleware.js";
import Admin from "../models/Admin.js";
import { generateTokens } from "../utils/jwt.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if admin has a password
    if (!admin.password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if password is hashed or plain text (for backward compatibility)
    let isMatch;
    if (
      admin.password.startsWith("$2b$") ||
      admin.password.startsWith("$2a$")
    ) {
      // Password is hashed
      isMatch = await bcrypt.compare(password, admin.password);
    } else {
      // Plain text password (for existing records)
      isMatch = admin.password === password;
      // Optionally hash it for future use
      if (isMatch) {
        admin.password = await bcrypt.hash(password, 10);
        await admin.save();
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(
      admin._id,
      admin.email
    );

    // Save refresh token to database
    admin.refreshToken = refreshToken;
    await admin.save();

    return res.status(200).json({
      message: "Login successful.",
      accessToken,
      refreshToken,
      user: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
});
// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();
    return res.status(201).json({ message: "Admin registered successfully." });
  } catch (err) {
    console.error("Registration error:", err);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required." });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res
        .status(403)
        .json({ message: "Invalid or expired refresh token." });
    }

    // Check if refresh token exists in database
    const admin = await Admin.findOne({
      _id: decoded.userId,
      refreshToken: refreshToken,
    });

    if (!admin) {
      return res.status(403).json({ message: "Invalid refresh token." });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      admin._id,
      admin.email
    );

    // Update refresh token in database
    admin.refreshToken = newRefreshToken;
    await admin.save();

    return res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    console.error("Refresh token error:", err);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// POST /api/auth/logout
router.post("/logout", authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId);
    if (admin) {
      admin.refreshToken = null;
      await admin.save();
    }
    return res.status(200).json({ message: "Logout successful." });
  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// GET /api/auth/me - Get current user info (protected route)
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.userId).select(
      "-password -refreshToken"
    );
    if (!admin) {
      return res.status(404).json({ message: "User not found." });
    }
    return res.status(200).json({
      user: {
        id: admin._id,
        email: admin.email,
      },
    });
  } catch (err) {
    console.error("Get user error:", err);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

// POST /api/auth/reset-password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required." });
    }
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "No account found with that email." });
    }
    admin.password = await bcrypt.hash(newPassword, 10);
    admin.refreshToken = null;
    await admin.save();
    return res.status(200).json({ message: "Password reset successfully." });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
});

export default router;
