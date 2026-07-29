import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDb from "./utils/connectDb.js";

// Load environment variables first
dotenv.config();

import authRoutes from "./routes/auth.js";
import serialNumberRoutes from "./routes/serialNumbers.js";
import clientRoutes from "./routes/clients.js";
import emailRoutes from "./routes/email.js";
import employeeRoutes from "./routes/employees.js";
import attendanceRoutes from "./routes/attendance.js";
import transactionRoutes from "./routes/transactions.js";
import documentQueueRoutes from "./routes/documentQueue.js";

const app = express();
/* ────────────────────────────────── Middlewares ────────────────────────────────── */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL?.trim(),
].filter(Boolean);

console.log("✅ Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

/* ──────────────────────────────── DB Connection ────────────────────────────────── */
connectDb()
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Failed to connect to MongoDB:", error);
  });
// /* ─────────────────────────────────── Routes ─────────────────────────────────────── */
app.get("/api/health", (_req, res) => res.json({ status: "ok" })); // Health check

// OAuth2 callback route (must be before /api/email to handle redirect from Google)
app.get("/oauth2callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

    // Import email service functions
    const { getTokensFromCode, saveTokens } = await import(
      "./utils/emailService.js"
    );

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Get user email from Google
    const { google } = await import("googleapis");
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URL
    );

    oauth2Client.setCredentials({
      access_token: tokens.access_token,
    });

    const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
    const { data } = await oauth2.userinfo.get();
    const email = data.email;

    // Try to get userId from state (if passed) or from token in Authorization header
    let userId = null;
    if (state) {
      // State might contain userId if we pass it
      try {
        userId = JSON.parse(Buffer.from(state, "base64").toString()).userId;
      } catch (e) {
        // If state doesn't contain userId, try to get from auth header
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const jwt = await import("jsonwebtoken");
          const token = authHeader.substring(7);
          const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        }
      }
    } else {
      // Try to get from auth header
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const jwt = await import("jsonwebtoken");
        const token = authHeader.substring(7);
        const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
        userId = decoded.userId;
      }
    }

    if (!userId) {
      // If we can't get userId, redirect to login
      return res.redirect(
        `${
          process.env.FRONTEND_URL || "http://localhost:5173"
        }/login?email_auth=error&message=Please login first`
      );
    }

    // Save tokens to database
    await saveTokens(userId, tokens, email);

    // Redirect to frontend with success message
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/?email_auth=success`
    );
  } catch (error) {
    console.error("Error in OAuth2 callback:", error);
    return res.redirect(
      `${
        process.env.FRONTEND_URL || "http://localhost:5173"
      }/?email_auth=error&message=${encodeURIComponent(error.message)}`
    );
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/serial-numbers", serialNumberRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/document-queue", documentQueueRoutes);
