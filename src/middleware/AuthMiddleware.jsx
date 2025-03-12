// src/middleware/AuthMiddleware.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { initData } from "@telegram-apps/sdk-react";
import { AuthService } from "../services/apiClient";
import LoadingScreen from "../components/LoadingScreen";

const AuthMiddleware = ({ children }) => {
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      // Skip if auth already checked
      if (isAuthChecked) return;

      // Check if already authenticated
      const existingToken = localStorage.getItem("token");
      if (existingToken) {
        setIsAuthChecked(true);
        return;
      }

      try {
        // Get Telegram init data
        const rawInitData = initData.raw();
        if (rawInitData) {
          // Authenticate with backend
          const response = await AuthService.webLogin(rawInitData);

          if (response && response.token) {
            localStorage.setItem("token", response.token);

            if (response.profile) {
              localStorage.setItem(
                "userProfile",
                JSON.stringify(response.profile)
              );
            }

            console.log("Authentication successful");
          } else {
            console.error("Authentication failed: No token received");
          }
        } else {
          console.error("No Telegram init data available");
        }
      } catch (error) {
        console.error("Authentication error:", error);
      } finally {
        // Mark auth as checked regardless of outcome
        setIsAuthChecked(true);
      }
    };

    handleAuth();
  }, [isAuthChecked]);

  // Show loading screen while checking authentication
  if (!isAuthChecked) {
    return <LoadingScreen />;
  }

  // Once auth is checked, render children
  return children;
};

export default AuthMiddleware;
