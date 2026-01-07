import { google } from "googleapis";
import OAuthToken from "../models/OAuthToken.js";

// Initialize OAuth2 client with environment variables
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URL
  );
};

/**
 * Get OAuth2 authorization URL
 */
export const getAuthUrl = (userId) => {
  const oauth2Client = getOAuth2Client();
  const scopes = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  // Encode userId in state parameter
  const state = Buffer.from(JSON.stringify({ userId })).toString("base64");

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    state: state,
  });
};

/**
 * Exchange authorization code for tokens
 */
export const getTokensFromCode = async (code) => {
  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    console.error("Error getting tokens from code:", error);
    throw error;
  }
};

/**
 * Get or refresh access token for a user
 */
export const getAccessToken = async (userId) => {
  try {
    const tokenDoc = await OAuthToken.findOne({ userId });

    if (!tokenDoc) {
      throw new Error("No OAuth token found. Please authenticate first.");
    }

    if (!tokenDoc.refreshToken) {
      throw new Error("No refresh token found. Please re-authenticate.");
    }

    // Check if token is expired or will expire in the next 5 minutes
    const now = new Date();
    const expiryDate = new Date(tokenDoc.expiryDate);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    if (expiryDate <= fiveMinutesFromNow) {
      // Refresh the token
      const oauth2Client = getOAuth2Client();
      oauth2Client.setCredentials({
        refresh_token: tokenDoc.refreshToken,
      });

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();

        // Calculate expiry date - Google returns expiry_date as timestamp in milliseconds
        let newExpiryDate;
        if (credentials.expiry_date) {
          // expiry_date can be a number (timestamp) or Date object
          if (typeof credentials.expiry_date === "number") {
            newExpiryDate = new Date(credentials.expiry_date);
          } else {
            newExpiryDate = new Date(credentials.expiry_date);
          }
        } else {
          // Default to 1 hour from now if not provided
          newExpiryDate = new Date(Date.now() + 3600 * 1000);
        }

        // Update token in database
        // Preserve refresh token if a new one isn't provided
        tokenDoc.accessToken = credentials.access_token;
        tokenDoc.expiryDate = newExpiryDate;
        if (credentials.refresh_token) {
          tokenDoc.refreshToken = credentials.refresh_token;
        }
        await tokenDoc.save();

        return credentials.access_token;
      } catch (refreshError) {
        console.error("Error refreshing access token:", refreshError);
        // If refresh fails, the refresh token might be invalid
        // Clear the token so user needs to re-authenticate
        await OAuthToken.deleteOne({ userId });
        throw new Error(
          "Failed to refresh access token. Please re-authenticate with Gmail."
        );
      }
    }

    return tokenDoc.accessToken;
  } catch (error) {
    console.error("Error getting access token:", error);
    throw error;
  }
};

/**
 * Save OAuth tokens to database
 */
export const saveTokens = async (userId, tokens, email) => {
  try {
    if (!tokens.access_token) {
      throw new Error("Access token is required");
    }

    if (!tokens.refresh_token) {
      console.warn(
        "No refresh token provided. User may need to re-authenticate."
      );
    }

    // Calculate expiry date - Google returns expiry_date as timestamp in milliseconds
    let expiryDate;
    if (tokens.expiry_date) {
      // expiry_date can be a number (timestamp) or Date object
      if (typeof tokens.expiry_date === "number") {
        expiryDate = new Date(tokens.expiry_date);
      } else {
        expiryDate = new Date(tokens.expiry_date);
      }
    } else {
      // Default to 1 hour from now if not provided
      expiryDate = new Date(Date.now() + 3600 * 1000);
    }

    // Find existing token to preserve refresh token if new one isn't provided
    const existingToken = await OAuthToken.findOne({ userId });

    await OAuthToken.findOneAndUpdate(
      { userId },
      {
        userId,
        accessToken: tokens.access_token,
        // Preserve existing refresh token if new one isn't provided
        refreshToken: tokens.refresh_token || existingToken?.refreshToken,
        expiryDate,
        email,
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error saving tokens:", error);
    throw error;
  }
};

/**
 * Send email using Gmail API
 */
export const sendEmail = async (userId, emailData) => {
  try {
    const accessToken = await getAccessToken(userId);

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Create email message
    const message = createEmailMessage(emailData);

    // Send email
    const response = await gmail.users.messages.send({
      userId: "me",
      requestBody: {
        raw: message,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Get sent emails from Gmail
 */
export const getSentEmails = async (userId, maxResults = 50) => {
  try {
    const accessToken = await getAccessToken(userId);

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get list of sent messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "in:sent",
      maxResults,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }

    // Get full message details
    const messages = await Promise.all(
      response.data.messages.map(async (msg) => {
        const message = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });
        return parseEmailMessage(message.data);
      })
    );

    return messages;
  } catch (error) {
    console.error("Error getting sent emails:", error);
    throw error;
  }
};

/**
 * Get received emails from Gmail inbox
 */
export const getInboxEmails = async (userId, maxResults = 50) => {
  try {
    const accessToken = await getAccessToken(userId);

    const oauth2Client = getOAuth2Client();
    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Get list of inbox messages
    const response = await gmail.users.messages.list({
      userId: "me",
      q: "in:inbox",
      maxResults,
    });

    if (!response.data.messages || response.data.messages.length === 0) {
      return [];
    }

    // Get full message details
    const messages = await Promise.all(
      response.data.messages.map(async (msg) => {
        const message = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });
        return parseEmailMessage(message.data);
      })
    );

    return messages;
  } catch (error) {
    console.error("Error getting inbox emails:", error);
    throw error;
  }
};

/**
 * Parse Gmail message to extract email details
 */
const parseEmailMessage = (message) => {
  const headers = message.payload.headers;
  const getHeader = (name) => {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase()
    );
    return header ? header.value : "";
  };

  const getBody = (payload) => {
    if (payload.body && payload.body.data) {
      return Buffer.from(payload.body.data, "base64").toString();
    }
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType === "text/plain" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString();
        }
        if (part.mimeType === "text/html" && part.body && part.body.data) {
          return Buffer.from(part.body.data, "base64").toString();
        }
        if (part.parts) {
          const body = getBody(part);
          if (body) return body;
        }
      }
    }
    return "";
  };

  return {
    id: message.id,
    threadId: message.threadId,
    from: getHeader("from"),
    to: getHeader("to"),
    subject: getHeader("subject"),
    date: new Date(parseInt(message.internalDate)),
    snippet: message.snippet,
    body: getBody(message.payload),
    labels: message.labelIds || [],
  };
};

/**
 * Create email message in RFC 2822 format
 */
const createEmailMessage = (emailData) => {
  const { to, subject, htmlBody, textBody } = emailData;

  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/html; charset=utf-8",
    "",
    htmlBody || textBody,
  ].join("\n");

  // Encode message in base64url format
  return Buffer.from(message)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
};

/**
 * Generate HTML email template
 */
export const generateEmailHTML = (data) => {
  const {
    type, // 'quotation', 'billing', 'challan'
    clientName,
    clientFirm,
    date,
    items,
    totalAmount,
    serialNumber,
  } = data;

  const documentType =
    type === "quotation"
      ? "Quotation"
      : type === "billing"
      ? "Invoice"
      : "Challan";

  const itemsHTML = items
    .map(
      (item, index) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${index + 1}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${
        item.item || ""
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${
        item.rate || 0
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${
        item.qty || 0
      }</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${(
        (item.rate || 0) * (item.qty || 0)
      ).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #486A47; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th { background-color: #486A47; color: white; padding: 10px; text-align: left; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 15px; }
        .footer { text-align: center; padding: 20px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Guruji Engineering Works</h1>
          <p>${documentType} - #${serialNumber || ""}</p>
        </div>
        <div class="content">
          <div class="details">
            <p><strong>Client Name:</strong> ${clientName || ""}</p>
            <p><strong>Company/Firm:</strong> ${clientFirm || ""}</p>
            <p><strong>Date:</strong> ${date || ""}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item</th>
                <th style="text-align: right;">Rate</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <div class="total">
            Total Amount: ₹${totalAmount || "0.00"}
          </div>
        </div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Guruji Engineering Works</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
