import { api } from "./api";

export interface EmailData {
  to: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  // Legacy fields (optional, for backward compatibility)
  type?: "quotation" | "billing" | "challan";
  clientName?: string;
  clientFirm?: string;
  date?: string;
  items?: Array<{
    item: string;
    rate: number;
    qty: number;
  }>;
  totalAmount?: string;
  serialNumber?: string;
}

export interface GmailEmail {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  date: Date;
  snippet: string;
  body: string;
  labels: string[];
}

/**
 * Get OAuth2 authorization URL
 */
export const getEmailAuthUrl = async (): Promise<string> => {
  try {
    const response = await api.get("/api/email/auth-url");
    if (response.ok) {
      const data = await response.json();
      return data.authUrl;
    }
    throw new Error("Failed to get authorization URL");
  } catch (error) {
    console.error("Error getting auth URL:", error);
    throw error;
  }
};

/**
 * Check if user has authenticated email
 */
export const checkEmailAuthStatus = async (): Promise<{
  authenticated: boolean;
  email: string | null;
}> => {
  try {
    const response = await api.get("/api/email/status");
    if (response.ok) {
      return await response.json();
    }
    return { authenticated: false, email: null };
  } catch (error) {
    console.error("Error checking email status:", error);
    return { authenticated: false, email: null };
  }
};

/**
 * Send email using Gmail API
 */
export const sendEmail = async (emailData: EmailData): Promise<void> => {
  try {
    const response = await api.post("/api/email/send", emailData);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send email");
    }
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/**
 * Get sent emails
 */
export const getSentEmails = async (maxResults: number = 50): Promise<GmailEmail[]> => {
  try {
    const response = await api.get(`/api/email/sent?maxResults=${maxResults}`);
    if (response.ok) {
      const emails = await response.json();
      return emails.map((email: any) => ({
        ...email,
        date: new Date(email.date),
      }));
    }
    throw new Error("Failed to get sent emails");
  } catch (error) {
    console.error("Error getting sent emails:", error);
    throw error;
  }
};

/**
 * Get inbox emails
 */
export const getInboxEmails = async (maxResults: number = 50): Promise<GmailEmail[]> => {
  try {
    const response = await api.get(`/api/email/inbox?maxResults=${maxResults}`);
    if (response.ok) {
      const emails = await response.json();
      return emails.map((email: any) => ({
        ...email,
        date: new Date(email.date),
      }));
    }
    throw new Error("Failed to get inbox emails");
  } catch (error) {
    console.error("Error getting inbox emails:", error);
    throw error;
  }
};

/**
 * Disconnect Gmail account
 */
export const disconnectGmail = async (): Promise<void> => {
  try {
    const response = await api.delete("/api/email/disconnect");
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to disconnect Gmail");
    }
  } catch (error) {
    console.error("Error disconnecting Gmail:", error);
    throw error;
  }
};

