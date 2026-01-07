import { useState, useEffect } from "react";
import { message } from "antd";
import { checkEmailAuthStatus, getEmailAuthUrl } from "../utils/email";

export const useEmailAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setLoading(true);
      const status = await checkEmailAuthStatus();
      setIsAuthenticated(status.authenticated);
      setUserEmail(status.email);
    } catch (error) {
      console.error("Error checking email auth status:", error);
    } finally {
      setLoading(false);
    }
  };

  const authenticate = async () => {
    try {
      const authUrl = await getEmailAuthUrl();
      window.location.href = authUrl;
    } catch (error) {
      message.error("Failed to initiate email authentication");
      console.error("Error getting auth URL:", error);
    }
  };

  return {
    isAuthenticated,
    userEmail,
    loading,
    authenticate,
    refreshStatus: checkStatus,
  };
};

