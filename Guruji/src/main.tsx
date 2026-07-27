import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import "./index.css";
import App from "./app/main-page/App";
import Login from "./app/admin/Login";
import LandingPage from "./app/landing/LandingPage";
import { authUtils } from "./utils/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authUtils.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster position="top-right" richColors closeButton />
    <BrowserRouter>
      <Routes>
        {/* Public landing page — shown to everyone */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Protected dashboard */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <App />
            </ProtectedRoute>
          }
        />

        {/* Fallback → landing page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
