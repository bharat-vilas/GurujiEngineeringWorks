import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getAuthUrl,
  getTokensFromCode,
  saveTokens,
  sendEmail,
  getSentEmails,
  getInboxEmails,
} from "../utils/emailService.js";

const router = express.Router();

// GET /api/email/auth-url - Get OAuth2 authorization URL
router.get("/auth-url", authenticateToken, (req, res) => {
  try {
    const authUrl = getAuthUrl(req.user.userId);
    return res.status(200).json({ authUrl });
  } catch (error) {
    console.error("Error generating auth URL:", error);
    return res.status(500).json({
      message: "Failed to generate authorization URL",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/email/oauth2callback - OAuth2 callback handler
// Note: We need to get userId from state parameter or session
router.get("/oauth2callback", async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ message: "Authorization code is required" });
    }

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

// POST /api/email/send - Send email
router.post("/send", authenticateToken, async (req, res) => {
  try {
    const { to, subject, htmlBody, textBody } = req.body;

    if (!to) {
      return res.status(400).json({
        message: "Recipient email is required",
      });
    }

    if (!subject && !htmlBody && !textBody) {
      return res.status(400).json({
        message: "Email subject or body is required",
      });
    }

    // Send email with simple body (no bill formatting)
    await sendEmail(req.user.userId, {
      to,
      subject: subject || "Email from Guruji Engineering Works",
      htmlBody: htmlBody || textBody?.replace(/\n/g, "<br>"),
      textBody: textBody || htmlBody?.replace(/<[^>]*>/g, ""),
    });

    return res.status(200).json({
      message: "Email sent successfully",
    });
  } catch (error) {
    console.error("Error sending email:", error);

    // Check if it's a token refresh error
    if (error.message && error.message.includes("re-authenticate")) {
      return res.status(401).json({
        message:
          "Gmail authentication expired. Please reconnect your Gmail account.",
        requiresReauth: true,
      });
    }

    return res.status(500).json({
      message: "Failed to send email",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/email/status - Check if user has authenticated email
router.get("/status", authenticateToken, async (req, res) => {
  try {
    const OAuthToken = (await import("../models/OAuthToken.js")).default;
    const token = await OAuthToken.findOne({ userId: req.user.userId });

    return res.status(200).json({
      authenticated: !!token,
      email: token?.email || null,
    });
  } catch (error) {
    console.error("Error checking email status:", error);
    return res.status(500).json({
      message: "Failed to check email status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/email/sent - Get sent emails
router.get("/sent", authenticateToken, async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 50;
    const emails = await getSentEmails(req.user.userId, maxResults);
    return res.status(200).json(emails);
  } catch (error) {
    console.error("Error getting sent emails:", error);

    // Check if it's a token refresh error
    if (error.message && error.message.includes("re-authenticate")) {
      return res.status(401).json({
        message:
          "Gmail authentication expired. Please reconnect your Gmail account.",
        requiresReauth: true,
      });
    }

    return res.status(500).json({
      message: "Failed to get sent emails",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// GET /api/email/inbox - Get inbox emails
router.get("/inbox", authenticateToken, async (req, res) => {
  try {
    const maxResults = parseInt(req.query.maxResults) || 50;
    const emails = await getInboxEmails(req.user.userId, maxResults);
    return res.status(200).json(emails);
  } catch (error) {
    console.error("Error getting inbox emails:", error);

    // Check if it's a token refresh error
    if (error.message && error.message.includes("re-authenticate")) {
      return res.status(401).json({
        message:
          "Gmail authentication expired. Please reconnect your Gmail account.",
        requiresReauth: true,
      });
    }

    return res.status(500).json({
      message: "Failed to get inbox emails",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// DELETE /api/email/disconnect - Disconnect Gmail account
router.delete("/disconnect", authenticateToken, async (req, res) => {
  try {
    const OAuthToken = (await import("../models/OAuthToken.js")).default;
    const result = await OAuthToken.deleteOne({ userId: req.user.userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "No Gmail account connected",
      });
    }

    return res.status(200).json({
      message: "Gmail account disconnected successfully",
    });
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    return res.status(500).json({
      message: "Failed to disconnect Gmail account",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

export default router;
